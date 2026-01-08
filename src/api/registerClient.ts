// src/api/registerClient.ts
const API_BASE_URL = "http://192.168.1.77:3000/api/v1";

type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    adresse: string;
    ville: string;
    codePostal: string;
};

export async function register(payload: RegisterPayload) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data;
}
