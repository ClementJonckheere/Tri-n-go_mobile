// src/api/client.ts
import { API_BASE_URL } from "../config";
import type { User } from "../types/user";
import type { Signalement } from "../types/signalement";
import { getToken, setToken, clearToken } from "../auth/session";

// ============================================================
// Types
// ============================================================
type ApiResponse<T> = { ok: boolean } & T;

export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    adresse: string;
    ville: string;
    codePostal: string;
};

export type CreateSignalementPayload = {
    description: string;
    typeEncombrant: string;
    adresse: string;
    ville: string;
    codePostal: string;
    lat?: number | null;
    lon?: number | null;
    photo?: string | null; // base64
};

export type UpdateProfilePayload = {
    name?: string;
    adresse?: string;
    ville?: string;
    codePostal?: string;
};

export type UsePointsPayload = {
    pointsToUse: number;
    decheterieAccountNumber: string;
    saveAccount?: boolean;
};

export type PointsInfo = {
    pointsTotal: number;
    cashbackRate: number;
    cashbackValue: number;
    nextPalier: number;
    progression: number;
    decheterieAccountNumber: string | null;
};

export type UsePointsResult = {
    pointsUsed: number;
    euros: number;
    newPointsTotal: number;
    decheterieAccountNumber: string;
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
export async function login(email: string, password: string): Promise<User> {
    const data = await request<ApiResponse<{ token: string; user: User }>>(
        "/auth/login",
        {
            method: "POST",
            body: { email, password },
        }
    );
    await setToken(data.token);
    return data.user;
}

export async function register(payload: RegisterPayload): Promise<User> {
    const data = await request<ApiResponse<{ user: User }>>(
        "/auth/register",
        {
            method: "POST",
            body: payload,
        }
    );
    return data.user;
}

export async function logout(): Promise<void> {
    await clearToken();
}

export async function me(): Promise<User> {
    const data = await request<ApiResponse<{ user: User }>>("/auth/me");
    return data.user;
}

// ============================================================
// Profil
// ============================================================
export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const data = await request<ApiResponse<{ user: User }>>(
        "/profile",
        {
            method: "PUT",
            body: payload,
        }
    );
    return data.user;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await request<ApiResponse<{}>>("/profile/password", {
        method: "PUT",
        body: { currentPassword, newPassword },
    });
}

// ============================================================
// Signalements
// ============================================================
export async function getSignalements(): Promise<Signalement[]> {
    const data = await request<ApiResponse<{ items: Signalement[] }>>(
        "/signalements"
    );
    return data.items ?? [];
}

export async function getSignalement(id: string): Promise<Signalement> {
    const data = await request<ApiResponse<{ item: Signalement }>>(
        `/signalements/${id}`
    );
    return data.item;
}

export async function createSignalement(
    payload: CreateSignalementPayload
): Promise<Signalement> {
    const data = await request<ApiResponse<{ item: Signalement }>>(
        "/signalements",
        {
            method: "POST",
            body: payload,
        }
    );
    return data.item;
}

// ============================================================
// Points & Cashback
// ============================================================
export async function getPointsInfo(): Promise<PointsInfo> {
    const data = await request<ApiResponse<PointsInfo>>("/points");
    return {
        pointsTotal: data.pointsTotal,
        cashbackRate: data.cashbackRate,
        cashbackValue: data.cashbackValue,
        nextPalier: data.nextPalier,
        progression: data.progression,
        decheterieAccountNumber: data.decheterieAccountNumber,
    };
}

export async function usePoints(payload: UsePointsPayload): Promise<UsePointsResult> {
    const data = await request<ApiResponse<UsePointsResult>>(
        "/points/use",
        {
            method: "POST",
            body: payload,
        }
    );
    return data;
}

// ============================================================
// Géocodage (proxy vers l'API IGN)
// ============================================================
export async function geocode(adresse: string, ville: string, codePostal: string): Promise<{
    lat: number;
    lon: number;
    label: string;
} | null> {
    try {
        const params = new URLSearchParams({ adresse, ville, codePostal });
        const data = await request<ApiResponse<{
            ok: boolean;
            lat: number;
            lon: number;
            label: string;
        }>>(`/geocode?${params.toString()}`);

        if (data.ok) {
            return { lat: data.lat, lon: data.lon, label: data.label };
        }
        return null;
    } catch {
        return null;
    }
}

export async function reverseGeocode(lat: number, lon: number): Promise<{
    adresse: string;
    ville: string;
    codePostal: string;
} | null> {
    try {
        const params = new URLSearchParams({
            lat: lat.toString(),
            lon: lon.toString()
        });
        const data = await request<ApiResponse<{
            ok: boolean;
            voie: string;
            commune: string;
            postcode: string;
            numero?: string;
        }>>(`/reverse-geocode?${params.toString()}`);

        if (data.ok) {
            const numero = data.numero ? `${data.numero} ` : "";
            return {
                adresse: `${numero}${data.voie || ""}`.trim(),
                ville: data.commune || "",
                codePostal: data.postcode || "",
            };
        }
        return null;
    } catch {
        return null;
    }
}