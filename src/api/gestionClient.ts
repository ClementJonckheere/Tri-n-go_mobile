// src/api/gestionClient.ts
import { getToken } from "../auth/session";
import { API_BASE_URL } from "../config";
import type { CitoyenRef, Signalement } from "../types/signalement";
import type { User } from "../types/user";
import { getSignalements } from "./client";

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
    signalementsUrgents?: number;
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
    email: string;
    role: string;
    perimetreVille: string;
    totalValides: number;
  }[];
  signalementsParVille?: {
    ville: string;
    enAttente: number;
    total: number;
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

export type ChefAgentInfo = {
  _id: string;
  name: string;
  email: string;
  perimetreVille: string;
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

function getCitoyenData(
  citoyen: string | CitoyenRef | undefined,
): CitoyenRef | null {
  if (!citoyen) return null;
  if (typeof citoyen === "object") return citoyen;
  return null;
}

// ============================================================
// Requête générique
// ============================================================
async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
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
  statut: string,
  chefAgentId?: string,
): Promise<{
  _id: string;
  statut: string;
  pointsAttribues: number;
  ancienStatut: string;
  pointsGagnes: number;
  chefAgentAssigne?: { _id: string; name?: string };
}> {
  const body: { statut: string; chefAgentId?: string } = { statut };
  if (chefAgentId) {
    body.chefAgentId = chefAgentId;
  }

  const data = await request<{ ok: boolean; item: Signalement }>(
    `/admin/signalements/${id}/statut`,
    {
      method: "PATCH",
      body,
    },
  );

  return {
    _id: data.item._id,
    statut: data.item.statut,
    pointsAttribues: data.item.pointsAttribues || 0,
    ancienStatut: "",
    pointsGagnes: 0,
    chefAgentAssigne:
      typeof data.item.chefAgentAssigne === "object"
        ? (data.item.chefAgentAssigne as { _id: string; name?: string })
        : undefined,
  };
}

export async function getCitoyenFiche(id: string): Promise<CitoyenFiche> {
  const allSignalements = await getSignalements();
  const signalements = allSignalements.filter(
    (s) => getCitoyenId(s.citoyen) === id,
  );

  const stats = {
    total: signalements.length,
    signale: signalements.filter((s) => s.statut === "signale").length,
    valide: signalements.filter((s) => s.statut === "valide").length,
    en_cours: signalements.filter((s) => s.statut === "en_cours").length,
    collecte: signalements.filter((s) => s.statut === "collecte").length,
    refuse: signalements.filter((s) => s.statut === "refuse").length,
  };

  const totalPoints = signalements.reduce(
    (sum, s) => sum + (s.pointsAttribues || 0),
    0,
  );

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

export async function getDashboardStats(
  perimetreVille?: string,
): Promise<DashboardStats> {
  try {
    const queryParams = new URLSearchParams();
    if (perimetreVille) queryParams.set("ville", perimetreVille);

    const queryString = queryParams.toString();
    const path = queryString
      ? `/admin/dashboard?${queryString}`
      : "/admin/dashboard";

    const data = await request<{
      ok: boolean;
      kpi: {
        totalSignalements: number;
        totalValides: number;
        totalEnCours: number;
        totalCollectes: number;
        totalRefuses: number;
        tauxValidation: number;
        signalementsUrgents?: number;
      };
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
        email: string;
        role: string;
        perimetreVille: string;
        totalValides: number;
      }[];
      signalementsParVille?: {
        ville: string;
        enAttente: number;
        total: number;
      }[];
      perimetres: string[];
      allowPerimetreFilter: boolean;
    }>(path);

    return {
      kpi: {
        totalSignalements: data.kpi.totalSignalements,
        totalValides: data.kpi.totalValides,
        totalEnCours: data.kpi.totalEnCours,
        totalCollectes: data.kpi.totalCollectes,
        totalRefuses: data.kpi.totalRefuses,
        totalCitoyens: data.classementCitoyens?.length || 0,
        tauxValidation: data.kpi.tauxValidation,
        signalementsUrgents: data.kpi.signalementsUrgents,
      },
      volumeParMois: [], // Le backend ne renvoie pas ça, on le laisse vide
      repartitionTypes: data.repartitionTypes || [],
      classementCitoyens: data.classementCitoyens || [],
      volumeParAgent: data.volumeParAgent || [],
      signalementsParVille: data.signalementsParVille || [],
      perimetreVille: perimetreVille || null,
      perimetres: data.perimetres || [],
      allowPerimetreFilter: data.allowPerimetreFilter,
    };
  } catch (e) {
    console.error("Erreur getDashboardStats:", e);
    // Fallback avec des valeurs par défaut
    return {
      kpi: {
        totalSignalements: 0,
        totalValides: 0,
        totalEnCours: 0,
        totalCollectes: 0,
        totalRefuses: 0,
        totalCitoyens: 0,
        tauxValidation: 0,
        signalementsUrgents: 0,
      },
      volumeParMois: [],
      repartitionTypes: [],
      classementCitoyens: [],
      volumeParAgent: [],
      signalementsParVille: [],
      perimetreVille: perimetreVille || null,
      perimetres: [],
      allowPerimetreFilter: false,
    };
  }
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
    return {
      totalCitoyens: 0,
      totalAgents: 0,
      totalChefAgents: 0,
      totalGestionnaires: 0,
      total: 0,
    };
  }
}

export async function getUsers(params?: {
  role?: string;
  search?: string;
  ville?: string;
}): Promise<UsersListResponse> {
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

export async function getUser(
  id: string,
): Promise<{ user: User; signalements: Signalement[] } | null> {
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

export async function toggleUserActive(
  id: string,
): Promise<{ _id: string; isActive: boolean }> {
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

export async function updateUser(
  id: string,
  payload: {
    name?: string;
    email?: string;
    role?: string;
    perimetreVille?: string;
    ville?: string;
    pointsTotal?: number;
  },
): Promise<User> {
  const data = await request<{ ok: boolean; user: User }>(`/users/${id}`, {
    method: "PUT",
    body: payload,
  });
  return data.user;
}

// ============================================================
// Chefs d'agents par ville (pour assignation d'équipe)
// ============================================================

export async function getChefAgentsByVille(
  ville: string,
): Promise<ChefAgentInfo[]> {
  try {
    const data = await request<{ ok: boolean; items: ChefAgentInfo[] }>(
      `/chef-agents?ville=${encodeURIComponent(ville)}`,
    );
    return data.items || [];
  } catch (e) {
    console.error("Erreur getChefAgentsByVille:", e);
    return [];
  }
}

// Assigner une équipe (chef d'agent) à un signalement
export async function assignEquipeToSignalement(
  signalementId: string,
  chefAgentId: string,
): Promise<{ ok: boolean }> {
  const data = await request<{ ok: boolean }>(
    `/admin/signalements/${signalementId}/assigner-equipe`,
    {
      method: "PATCH",
      body: { chefAgentId },
    },
  );
  return data;
}
