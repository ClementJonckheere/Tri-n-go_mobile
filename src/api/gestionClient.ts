// src/api/gestionClient.ts
import { API_BASE_URL } from "../config";
import type { User } from "../types/user";
import type { Signalement, CitoyenRef, HistoriqueStatut } from "../types/signalement";
import { getToken } from "../auth/session";
import { getSignalements, me } from "./client";

// ============================================================
// Types
// ============================================================
export type GestionSignalement = Signalement;

export type GestionSignalementsResponse = {
    items: GestionSignalement[];
    total: number;
    villes: string[];
    currentVille: string | null;
};

export type CitoyenFiche = {
    citoyen: User;
    signalements: Signalement[];
    stats: {
        total: number;
        signale: number;
        valide: number;
        en_cours: number;
        collecte: number;
        refuse: number;
    };
    totalPoints: number;
};

export type DashboardStats = {
    kpi: {
        totalSignalements: number;
        totalValides: number;
        totalEnCours: number;
        totalCollectes: number;
        totalRefuses: number;
        totalCitoyens: number;
        tauxValidation: number;
    };
    volumeParMois: { periode: string; total: number }[];
    repartitionTypes: { type: string; total: number }[];
    classementCitoyens: {
        rank: number;
        citoyenId: string;
        name: string;
        email: string;
        ville: string;
        points: number;
        nbSignalements: number;
    }[];
    volumeParAgent: {
        rank: number;
        agentId: string;
        name: string;
        role: string;
        perimetreVille: string;
        totalValides: number;
    }[];
    perimetreVille: string | null;
    perimetres: string[];
    allowPerimetreFilter: boolean;
};

export type UsersStats = {
    totalCitoyens: number;
    totalAgents: number;
    totalChefAgents: number;
    totalGestionnaires: number;
    total: number;
};

export type UsersListResponse = {
    items: User[];
    total: number;
    perimetres: string[];
};

// ============================================================
// Helpers
// ============================================================
function getCitoyenId(citoyen: string | CitoyenRef | undefined): string | null {
    if (!citoyen) return null;
    if (typeof citoyen === "string") return citoyen;
    return citoyen._id || null;
}

function getCitoyenData(citoyen: string | CitoyenRef | undefined): CitoyenRef | null {
    if (!citoyen) return null;
    if (typeof citoyen === "object") return citoyen;
    return null;
}

// ============================================================
// Requête générique
// ============================================================
async function request<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
    const token = await getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: opts.method ?? "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message ?? `Erreur HTTP ${res.status}`);
    return data as T;
}

// ============================================================
// Gestion des signalements
// ============================================================

export async function getGestionSignalements(params?: {
    ville?: string;
    statut?: string;
}): Promise<GestionSignalementsResponse> {
    let items = await getSignalements();

    const villesSet = new Set<string>();
    items.forEach((s) => {
        if (s.ville) villesSet.add(s.ville);
    });
    const villes = Array.from(villesSet).sort();

    if (params?.ville) {
        items = items.filter((s) => s.ville === params.ville);
    }
    if (params?.statut) {
        items = items.filter((s) => s.statut === params.statut);
    }

    return {
        items,
        total: items.length,
        villes,
        currentVille: params?.ville || null,
    };
}

export async function updateSignalementStatut(
    id: string,
    statut: string
): Promise<{
    _id: string;
    statut: string;
    pointsAttribues: number;
    ancienStatut: string;
    pointsGagnes: number;
}> {
    const data = await request<{ ok: boolean; item: Signalement }>(`/admin/signalements/${id}/statut`, {
        method: "PATCH",
        body: { statut },
    });

    return {
        _id: data.item._id,
        statut: data.item.statut,
        pointsAttribues: data.item.pointsAttribues || 0,
        ancienStatut: "",
        pointsGagnes: 0,
    };
}

export async function getCitoyenFiche(id: string): Promise<CitoyenFiche> {
    const allSignalements = await getSignalements();
    const signalements = allSignalements.filter((s) => getCitoyenId(s.citoyen) === id);

    const stats = {
        total: signalements.length,
        signale: signalements.filter((s) => s.statut === "signale").length,
        valide: signalements.filter((s) => s.statut === "valide").length,
        en_cours: signalements.filter((s) => s.statut === "en_cours").length,
        collecte: signalements.filter((s) => s.statut === "collecte").length,
        refuse: signalements.filter((s) => s.statut === "refuse").length,
    };

    const totalPoints = signalements.reduce((sum, s) => sum + (s.pointsAttribues || 0), 0);

    const firstSignalement = signalements[0];
    const citoyenData = getCitoyenData(firstSignalement?.citoyen);

    const citoyen: User = {
        _id: id,
        name: citoyenData?.name || "Citoyen",
        email: citoyenData?.email || "",
        role: "citoyen",
        ville: citoyenData?.ville || firstSignalement?.ville || "",
        pointsTotal: citoyenData?.pointsTotal || totalPoints,
    };

    return { citoyen, signalements, stats, totalPoints };
}

// ============================================================
// Dashboard statistiques
// ============================================================

export async function getDashboardStats(perimetreVille?: string): Promise<DashboardStats> {
    const user = await me();
    let items = await getSignalements();

    const perimetresSet = new Set<string>();
    items.forEach((s) => {
        if (s.ville) perimetresSet.add(s.ville);
    });
    const perimetres = Array.from(perimetresSet).sort();

    const isGestionnaire = user.role === "gestionnaire";
    const allowPerimetreFilter = isGestionnaire;

    if (!isGestionnaire && user.perimetreVille) {
        items = items.filter((s) => s.ville === user.perimetreVille);
    } else if (perimetreVille) {
        items = items.filter((s) => s.ville === perimetreVille);
    }

    const totalSignalements = items.length;
    const totalValides = items.filter((s) => s.statut === "valide").length;
    const totalEnCours = items.filter((s) => s.statut === "en_cours").length;
    const totalCollectes = items.filter((s) => s.statut === "collecte").length;
    const totalRefuses = items.filter((s) => s.statut === "refuse").length;
    const tauxValidation = totalSignalements > 0 ? Math.round((totalValides / totalSignalements) * 100) : 0;

    // Volume par mois
    const volumeByMonth: Record<string, number> = {};
    items.forEach((s) => {
        const date = s.dateSignalement || s.createdAt;
        if (date) {
            const d = new Date(date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            volumeByMonth[key] = (volumeByMonth[key] || 0) + 1;
        }
    });
    const volumeParMois = Object.entries(volumeByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([periode, total]) => ({ periode, total }));

    // Répartition par type
    const typeCount: Record<string, number> = {};
    items.forEach((s) => {
        const t = s.typeEncombrant || "inconnu";
        typeCount[t] = (typeCount[t] || 0) + 1;
    });
    const repartitionTypes = Object.entries(typeCount)
        .map(([type, total]) => ({ type, total }))
        .sort((a, b) => b.total - a.total);

    // Classement citoyens
    const citoyenPoints: Record<string, { name: string; email: string; ville: string; points: number; nb: number }> = {};
    items.forEach((s) => {
        const citoyenId = getCitoyenId(s.citoyen);
        if (!citoyenId) return;
        if (!citoyenPoints[citoyenId]) {
            const citoyenData = getCitoyenData(s.citoyen);
            citoyenPoints[citoyenId] = {
                name: citoyenData?.name || "Citoyen",
                email: citoyenData?.email || "",
                ville: citoyenData?.ville || s.ville || "",
                points: 0,
                nb: 0,
            };
        }
        citoyenPoints[citoyenId].points += s.pointsAttribues || 0;
        citoyenPoints[citoyenId].nb += 1;
    });

    const classementCitoyens = Object.entries(citoyenPoints)
        .filter(([, c]) => c.points > 0)
        .sort(([, a], [, b]) => b.points - a.points)
        .slice(0, 10)
        .map(([id, c], i) => ({
            rank: i + 1,
            citoyenId: id,
            name: c.name,
            email: c.email,
            ville: c.ville,
            points: c.points,
            nbSignalements: c.nb,
        }));

    // Volume par agent
    const agentValidations: Record<string, { name: string; role: string; perimetreVille: string; count: number }> = {};
    items.forEach((s) => {
        const historique = s.historiqueStatuts || [];
        historique.forEach((h: HistoriqueStatut) => {
            if (h.to === "valide" && h.changedBy) {
                const agentId = typeof h.changedBy === "object" ? h.changedBy._id : h.changedBy;
                if (!agentValidations[agentId]) {
                    agentValidations[agentId] = { name: "Agent", role: "", perimetreVille: "", count: 0 };
                }
                agentValidations[agentId].count += 1;
            }
        });
    });

    const volumeParAgent = Object.entries(agentValidations)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([id, a], i) => ({
            rank: i + 1,
            agentId: id,
            name: a.name,
            role: a.role,
            perimetreVille: a.perimetreVille,
            totalValides: a.count,
        }));

    return {
        kpi: {
            totalSignalements,
            totalValides,
            totalEnCours,
            totalCollectes,
            totalRefuses,
            totalCitoyens: Object.keys(citoyenPoints).length,
            tauxValidation,
        },
        volumeParMois,
        repartitionTypes,
        classementCitoyens,
        volumeParAgent,
        perimetreVille: perimetreVille || (isGestionnaire ? null : user.perimetreVille) || null,
        perimetres,
        allowPerimetreFilter,
    };
}

// ============================================================
// Gestion des utilisateurs
// ============================================================

export async function getUsersStats(): Promise<UsersStats> {
    try {
        const data = await request<{
            ok: boolean;
            totalCitoyens: number;
            totalAgents: number;
            totalChefAgents: number;
            totalGestionnaires: number;
            total: number;
        }>("/users/stats");

        return {
            totalCitoyens: data.totalCitoyens || 0,
            totalAgents: data.totalAgents || 0,
            totalChefAgents: data.totalChefAgents || 0,
            totalGestionnaires: data.totalGestionnaires || 0,
            total: data.total || 0,
        };
    } catch (e) {
        console.error("Erreur getUsersStats:", e);
        return { totalCitoyens: 0, totalAgents: 0, totalChefAgents: 0, totalGestionnaires: 0, total: 0 };
    }
}

export async function getUsers(params?: { role?: string; search?: string; ville?: string }): Promise<UsersListResponse> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.role) queryParams.set("role", params.role);
        if (params?.search) queryParams.set("search", params.search);
        if (params?.ville) queryParams.set("ville", params.ville);

        const queryString = queryParams.toString();
        const path = queryString ? `/users?${queryString}` : "/users";

        const data = await request<{
            ok: boolean;
            items: User[];
            total: number;
            perimetres: string[];
        }>(path);

        return {
            items: data.items || [],
            total: data.total || 0,
            perimetres: data.perimetres || [],
        };
    } catch (e) {
        console.error("Erreur getUsers:", e);
        return { items: [], total: 0, perimetres: [] };
    }
}

export async function getUser(id: string): Promise<{ user: User; signalements: Signalement[] } | null> {
    try {
        const data = await request<{
            ok: boolean;
            user: User;
            signalements: Signalement[];
        }>(`/users/${id}`);

        return {
            user: data.user,
            signalements: data.signalements || [],
        };
    } catch (e) {
        console.error("Erreur getUser:", e);
        return null;
    }
}

export async function toggleUserActive(id: string): Promise<{ _id: string; isActive: boolean }> {
    const data = await request<{
        ok: boolean;
        _id: string;
        isActive: boolean;
    }>(`/users/${id}/toggle-active`, { method: "PATCH" });

    return {
        _id: data._id,
        isActive: data.isActive,
    };
}

export async function createUser(payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    perimetreVille?: string;
}): Promise<User> {
    const data = await request<{ ok: boolean; user: User }>("/users", {
        method: "POST",
        body: payload,
    });
    return data.user;
}

export async function updateUser(id: string, payload: {
    name?: string;
    email?: string;
    role?: string;
    perimetreVille?: string;
    ville?: string;
    pointsTotal?: number;
}): Promise<User> {
    const data = await request<{ ok: boolean; user: User }>(`/users/${id}`, {
        method: "PUT",
        body: payload,
    });
    return data.user;
}