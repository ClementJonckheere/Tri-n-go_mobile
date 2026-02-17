// app/(tabs-agent)/profile-agent.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { me, logout } from "../../src/api/client";
import type { User } from "../../src/types/user";
import { ROLE_LABELS } from "../../src/types/user";

const COLORS = { bg: "#F5F7FA", card: "#FFFFFF", title: "#022B3A", text: "#111827", muted: "#6b7785", border: "#E5E7EB", blue: "#06668C", green: "#70be55", danger: "#B00020" };

export default function ProfileAgentScreen() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { me().then(setUser).catch(console.error).finally(() => setLoading(false)); }, []);

    async function handleLogout() {
        Alert.alert("Déconnexion", "Êtes-vous sûr ?", [{ text: "Annuler", style: "cancel" }, { text: "Déconnexion", style: "destructive", onPress: async () => { await logout(); router.replace("/(auth)/login"); }}]);
    }

    if (loading) return <View style={[styles.page, styles.center]}><ActivityIndicator size="large" color={COLORS.blue} /></View>;

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.container}>
            <View style={styles.headerCard}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text></View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}><Text style={styles.roleText}>{ROLE_LABELS[user?.role || "agent"]}</Text></View>
            </View>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Informations</Text>
                <View style={styles.row}><Text style={styles.label}>Périmètre</Text><Text style={styles.value}>{user?.perimetreVille || "Aucun"}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Email</Text><Text style={styles.value}>{user?.email}</Text></View>
            </View>
            <Pressable style={styles.logoutBtn} onPress={handleLogout}><Text style={styles.logoutText}>Se déconnecter</Text></Pressable>
            <Text style={styles.version}>Tri'n Go Pro v1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg }, container: { padding: 16, gap: 14, paddingBottom: 30 }, center: { flex: 1, alignItems: "center", justifyContent: "center" },
    headerCard: { backgroundColor: COLORS.card, padding: 20, borderRadius: 18, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
    avatar: { width: 72, height: 72, borderRadius: 999, backgroundColor: COLORS.blue, alignItems: "center", justifyContent: "center", marginBottom: 12 }, avatarText: { color: "#fff", fontSize: 28, fontWeight: "900" },
    name: { fontSize: 20, fontWeight: "900", color: COLORS.title }, email: { color: COLORS.muted, marginTop: 4 },
    roleBadge: { marginTop: 10, backgroundColor: "rgba(6,102,140,0.1)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 }, roleText: { color: COLORS.blue, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
    card: { backgroundColor: COLORS.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border }, cardTitle: { fontSize: 15, fontWeight: "900", color: COLORS.title, marginBottom: 12 },
    row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border }, label: { color: COLORS.muted }, value: { color: COLORS.text, fontWeight: "700" },
    logoutBtn: { backgroundColor: "rgba(176,0,32,0.1)", paddingVertical: 14, borderRadius: 999, alignItems: "center" }, logoutText: { color: COLORS.danger, fontWeight: "800" },
    version: { textAlign: "center", color: COLORS.muted, fontSize: 12, marginTop: 8 },
});