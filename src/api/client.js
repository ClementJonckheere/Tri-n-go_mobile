// src/api/client.ts
import { getToken, setToken } from "../auth/session";

const API_BASE_URL = "http://192.168.1.77:3000/api/v1";

async function request(path: string, { method = "GET", body }: any = {}) {
    const token = await getToken();

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data;
}

export async function login(email: string, password: string) {
    const data = await request("/auth/login", {
        method: "POST",
        body: { email, password },
    });
    await setToken(data.token);
    return data.user;
}

export async function me() {
    const data = await request("/auth/me");
    return data.user;
}

export async function getSignalements() {
    const data = await request("/signalements");
    return data.items;
}
