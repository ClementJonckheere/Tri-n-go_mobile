// src/api/client.ts
// Client API adapté au backend existant (routes/api.js)

import { API_BASE_URL } from "../config";
import type { User } from "../types/user";
import type { Signalement } from "../types/signalement";
import { getToken, setToken, clearToken } from "../auth/session";

// ============================================================
// Types
// ============================================================
export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    adresse?: string;
    ville?: string;
    codePostal?: string;
};

export type CreateSignalementPayload = {
    description: string;
    typeEncombrant: string;
    adresse: string;
    ville: string;
    codePostal: string;
    lat?: number | null;
    lon?: number | null;
    photo?: string | null; // base64 image data:image/...
};

// ============================================================
// Requête générique
// ============================================================
async function request<T>(
    path: string,
    opts: { method?: string; body?: unknown } = {}
): Promise<T> {
    const token = await getToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: opts.method ?? "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.message ?? `Erreur HTTP ${res.status}`);
    }

    return data as T;
}

// ============================================================
// Authentification
// ============================================================

/**
 * Connexion - POST /api/v1/auth/login
 */
export async function login(email: string, password: string): Promise<User> {
    const data = await request<{
        ok: boolean;
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            perimetreVille: string | null;
        };
    }>("/auth/login", {
        method: "POST",
        body: { email, password },
    });

    await setToken(data.token);

    return {
        _id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        perimetreVille: data.user.perimetreVille,
    } as User;
}

/**
 * Inscription - POST /api/v1/auth/register
 */
export async function register(payload: RegisterPayload): Promise<User> {
    const data = await request<{
        ok: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    }>("/auth/register", {
        method: "POST",
        body: payload,
    });

    return {
        _id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
    } as User;
}

/**
 * Déconnexion
 */
export async function logout(): Promise<void> {
    await clearToken();
}

/**
 * Utilisateur connecté - GET /api/v1/auth/me
 */
export async function me(): Promise<User> {
    const data = await request<{
        ok: boolean;
        user: {
            _id?: string;
            id?: string;
            name: string;
            email: string;
            role: string;
            pointsTotal?: number;
            ville?: string;
            codePostal?: string;
            perimetreVille?: string | null;
            cashbackUsedTotal?: number;
            decheterieAccountNumber?: string;
        };
    }>("/auth/me");

    return {
        _id: data.user._id || data.user.id || "",
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        pointsTotal: data.user.pointsTotal || 0,
        ville: data.user.ville,
        codePostal: data.user.codePostal,
        perimetreVille: data.user.perimetreVille,
        cashbackUsedTotal: data.user.cashbackUsedTotal || 0,
        decheterieAccountNumber: data.user.decheterieAccountNumber,
    } as User;
}

// ============================================================
// Signalements
// ============================================================

/**
 * Liste des signalements - GET /api/v1/signalements
 */
export async function getSignalements(): Promise<Signalement[]> {
    const data = await request<{ ok: boolean; items: Signalement[] }>("/signalements");
    return data.items ?? [];
}

/**
 * Détail d'un signalement (filtre local)
 */
export async function getSignalement(id: string): Promise<Signalement | null> {
    const items = await getSignalements();
    return items.find((s) => s._id === id) || null;
}

/**
 * Créer un signalement - POST /api/v1/signalements
 */
export async function createSignalement(payload: CreateSignalementPayload): Promise<Signalement> {
    const data = await request<{ ok: boolean; item: Signalement }>("/signalements", {
        method: "POST",
        body: payload,
    });
    return data.item;
}

/**
 * Changer le statut - PATCH /api/v1/admin/signalements/:id/statut
 */
export async function updateSignalementStatut(id: string, statut: string): Promise<Signalement> {
    const data = await request<{ ok: boolean; item: Signalement }>(`/admin/signalements/${id}/statut`, {
        method: "PATCH",
        body: { statut },
    });
    return data.item;
}

// ============================================================
// Points (calculé côté client)
// ============================================================
const PALIER = 100;
const CASHBACK_RATES = [
    { min: 0, max: 99, rate: 0.05 },
    { min: 100, max: 299, rate: 0.06 },
    { min: 300, max: 499, rate: 0.07 },
    { min: 500, max: Infinity, rate: 0.08 },
];

function getCashbackRate(points: number): number {
    for (const tier of CASHBACK_RATES) {
        if (points >= tier.min && points <= tier.max) return tier.rate;
    }
    return 0.05;
}

export type PointsInfo = {
    pointsTotal: number;
    cashbackRate: number;
    cashbackValue: number;
    nextPalier: number;
    progression: number;
    decheterieAccountNumber: string | null;
};

export async function getPointsInfo(): Promise<PointsInfo> {
    const user = await me();
    const pointsTotal = user.pointsTotal || 0;
    const cashbackRate = getCashbackRate(pointsTotal);
    const cashbackValue = pointsTotal * cashbackRate;
    const nextPalier = (Math.floor(pointsTotal / PALIER) + 1) * PALIER;
    const previousPalier = nextPalier - PALIER;
    const progression = Math.max(0, Math.min(100, ((pointsTotal - previousPalier) / PALIER) * 100));

    return {
        pointsTotal,
        cashbackRate,
        cashbackValue: Math.round(cashbackValue * 100) / 100,
        nextPalier,
        progression: Math.round(progression),
        decheterieAccountNumber: user.decheterieAccountNumber || null,
    };
}

// ============================================================
// Géocodage (appel direct IGN)
// ============================================================
export async function geocode(adresse: string, ville: string, codePostal: string): Promise<{ lat: number; lon: number; label: string } | null> {
    try {
        const q = [adresse, codePostal, ville].filter(Boolean).join(" ");
        const res = await fetch(`https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(q)}&limit=1`);
        const data = await res.json();
        if (data?.features?.length > 0) {
            const f = data.features[0];
            const [lon, lat] = f.geometry.coordinates;
            return { lat, lon, label: f.properties?.label || q };
        }
        return null;
    } catch { return null; }
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ adresse: string; ville: string; codePostal: string } | null> {
    try {
        const res = await fetch(`https://data.geopf.fr/geocodage/reverse?lat=${lat}&lon=${lon}&limit=1`);
        const data = await res.json();
        if (data?.features?.length > 0) {
            const p = data.features[0].properties || {};
            return {
                adresse: `${p.housenumber ? p.housenumber + " " : ""}${p.street || ""}`.trim(),
                ville: p.city || "",
                codePostal: p.postcode || "",
            };
        }
        return null;
    } catch { return null; }
}

export async function healthCheck(): Promise<boolean> {
    try {
        const data = await request<{ ok: boolean }>("/health");
        return data.ok === true;
    } catch { return false; }
}

// ============================================================
// Profil
// ============================================================
export type UpdateProfilePayload = {
    name?: string;
    adresse?: string;
    ville?: string;
    codePostal?: string;
};

/**
 * Modifier le profil - PUT /api/v1/profile
 * NOTE: Nécessite d'ajouter cette route dans votre api.js backend
 */
export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const data = await request<{ ok: boolean; user: User }>("/profile", {
        method: "PUT",
        body: payload,
    });
    return data.user;
}