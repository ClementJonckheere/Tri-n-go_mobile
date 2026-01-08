import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.1.77:3000/api/v1';

async function getToken() {
    return await SecureStore.getItemAsync('token');
}

async function request(path, { method = 'GET', body } = {}) {
    const token = await getToken();

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data;
}

export async function login(email, password) {
    const data = await request('/auth/login', { method: 'POST', body: { email, password } });
    await SecureStore.setItemAsync('token', data.token);
    return data.user;
}

export async function me() {
    const data = await request('/auth/me');
    return data.user;
}

export async function getSignalements() {
    const data = await request('/signalements');
    return data.items;
}

export async function logout() {
    await SecureStore.deleteItemAsync('token');
}

export async function hasToken() {
    const t = await getToken();
    return !!t;
}
