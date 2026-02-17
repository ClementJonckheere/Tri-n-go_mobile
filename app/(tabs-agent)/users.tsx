// app/(tabs-agent)/users.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl, TextInput, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getUsers, getUsersStats, toggleUserActive, type UsersStats } from "../../src/api/gestionClient";
import type { User } from "../../src/types/user";
import { ROLE_LABELS } from "../../src/types/user";

const COLORS = { bg: "#F5F7FA", card: "#FFFFFF", title: "#022B3A", text: "#111827", muted: "#6b7785", border: "#E5E7EB", blue: "#06668C", green: "#70be55", danger: "#B00020", orange: "#F59E0B", purple: "#7C3AED" };
const ROLES = ["citoyen", "agent", "chef_agent", "gestionnaire"] as const;

function RoleBadge({ role }: { role: string }) {
    const colors: Record<string, string> = { citoyen: COLORS.green, agent: COLORS.blue, chef_agent: COLORS.orange, gestionnaire: COLORS.purple };
    return <View style={[styles.roleBadge, { backgroundColor: `${colors[role] || COLORS.muted}20` }]}><Text style={[styles.roleBadgeText, { color: colors[role] || COLORS.muted }]}>{ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}</Text></View>;
}

export default function UsersScreen() {
    const [items, setItems] = useState<User[]>([]);
    const [stats, setStats] = useState<UsersStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    async function load() {
        try {
            const [data, statsData] = await Promise.all([getUsers({ role: selectedRole || undefined, search: search || undefined }), getUsersStats()]);
            setItems(data.items); setStats(statsData);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, [selectedRole]);
    useFocusEffect(useCallback(() => { load(); }, []));
    async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

    async function handleToggleActive(user: User) {
        Alert.alert(user.isActive !== false ? "Désactiver" : "Activer", `${user.name} ?`, [{ text: "Annuler", style: "cancel" }, { text: "OK", onPress: async () => {
                try { const r = await toggleUserActive(user._id); setItems(prev => prev.map(u => u._id === user._id ? { ...u, isActive: r.isActive } : u)); } catch (e: any) { Alert.alert("Erreur", e?.message); }
            }}]);
    }

    if (loading) return <View style={[styles.page, styles.center]}><ActivityIndicator size="large" color={COLORS.blue} /></View>;

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            {stats && <View style={styles.statsRow}><View style={styles.statBox}><Text style={styles.statValue}>{stats.totalCitoyens}</Text><Text style={styles.statLabel}>Citoyens</Text></View><View style={styles.statBox}><Text style={[styles.statValue, { color: COLORS.blue }]}>{stats.totalAgents}</Text><Text style={styles.statLabel}>Agents</Text></View><View style={styles.statBox}><Text style={[styles.statValue, { color: COLORS.orange }]}>{stats.totalChefAgents}</Text><Text style={styles.statLabel}>Chefs</Text></View></View>}
            <View style={styles.searchRow}><TextInput style={styles.searchInput} placeholder="Rechercher..." value={search} onChangeText={setSearch} onSubmitEditing={() => { setLoading(true); load(); }} /><Pressable style={styles.searchBtn} onPress={() => { setLoading(true); load(); }}><Text style={{ fontSize: 18 }}>🔍</Text></Pressable></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}><Pressable style={[styles.chip, !selectedRole && styles.chipActive]} onPress={() => setSelectedRole(null)}><Text style={[styles.chipText, !selectedRole && styles.chipTextActive]}>Tous</Text></Pressable>{ROLES.map(r => <Pressable key={r} style={[styles.chip, selectedRole === r && styles.chipActive]} onPress={() => setSelectedRole(r)}><Text style={[styles.chipText, selectedRole === r && styles.chipTextActive]}>{ROLE_LABELS[r]}</Text></Pressable>)}</ScrollView>
            <Text style={styles.countText}>{items.length} utilisateur{items.length > 1 ? "s" : ""}</Text>
            {items.map(user => (
                <View key={user._id} style={styles.card}>
                    <View style={styles.cardHeader}><View style={styles.avatarSmall}><Text style={{ color: "#fff", fontWeight: "900" }}>{user.name?.charAt(0).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.userName}>{user.name}</Text><Text style={styles.userEmail}>{user.email}</Text></View><RoleBadge role={user.role} /></View>
                    <View style={styles.cardMeta}><Text style={styles.metaText}>📍 {user.ville || user.perimetreVille || "—"}</Text>{user.role === "citoyen" && <Text style={{ color: COLORS.green, fontWeight: "800" }}>{user.pointsTotal || 0} pts</Text>}</View>
                    <View style={styles.cardActions}><Pressable style={[styles.actionBtn, { backgroundColor: user.isActive !== false ? "rgba(176,0,32,0.1)" : "rgba(112,190,85,0.1)" }]} onPress={() => handleToggleActive(user)}><Text style={{ color: user.isActive !== false ? COLORS.danger : COLORS.green, fontWeight: "700" }}>{user.isActive !== false ? "Désactiver" : "Activer"}</Text></Pressable><View style={[styles.statusDot, { backgroundColor: user.isActive !== false ? COLORS.green : COLORS.danger }]} /></View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg }, container: { padding: 16, gap: 12, paddingBottom: 30 }, center: { flex: 1, alignItems: "center", justifyContent: "center" },
    statsRow: { flexDirection: "row", gap: 8 }, statBox: { flex: 1, backgroundColor: COLORS.card, padding: 12, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.border }, statValue: { fontSize: 20, fontWeight: "900", color: COLORS.title }, statLabel: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
    searchRow: { flexDirection: "row", gap: 8 }, searchInput: { flex: 1, backgroundColor: COLORS.card, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border }, searchBtn: { backgroundColor: COLORS.blue, width: 44, height: 44, borderRadius: 999, alignItems: "center", justifyContent: "center" },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: COLORS.card, marginRight: 8, borderWidth: 1, borderColor: COLORS.border }, chipActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue }, chipText: { fontWeight: "700", color: COLORS.muted }, chipTextActive: { color: "#fff" },
    countText: { color: COLORS.muted, fontWeight: "700" }, card: { backgroundColor: COLORS.card, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 }, avatarSmall: { width: 40, height: 40, borderRadius: 999, backgroundColor: COLORS.blue, alignItems: "center", justifyContent: "center" },
    userName: { fontWeight: "900", color: COLORS.title }, userEmail: { color: COLORS.muted, fontSize: 12 },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }, roleBadgeText: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
    cardMeta: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" }, metaText: { color: COLORS.muted, fontSize: 13 },
    cardActions: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }, statusDot: { width: 10, height: 10, borderRadius: 999 },
});