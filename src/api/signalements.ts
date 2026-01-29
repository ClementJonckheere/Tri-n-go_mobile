import { getToken } from "../auth/session";

const API_BASE_URL = "http://192.168.1.77:3000/api/v1";

type Payload = {
    description: string;
    typeEncombrant: string;
    photo?: string | null;
};

export async function createSignalement(payload: Payload) {
    const token = await getToken();

    const res = await fetch(`${API_BASE_URL}/signalements`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
}
