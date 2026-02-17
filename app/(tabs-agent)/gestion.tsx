// app/(tabs-agent)/gestion.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl, Alert, Modal } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { me } from "../../src/api/client";
import { getGestionSignalements, updateSignalementStatut, type GestionSignalement } from "../../src/api/gestionClient";
import type { User } from "../../src/types/user";
import { TYPE_ENCOMBRANT_LABELS, STATUT_LABELS, type CitoyenRef } from "../../src/types/signalement";

const COLORS = { bg: "#F5F7FA", card: "#FFFFFF", title: "#022B3A", text: "#111827", muted: "#6b7785", border: "#E5E7EB", blue: "#06668C", green: "#70be55", danger: "#B00020", orange: "#F59E0B" };
const STATUTS = ["signale", "valide", "en_cours", "collecte", "refuse"] as const;

function getCitoyenData(citoyen: string | CitoyenRef | undefined): CitoyenRef | null {
    if (!citoyen) return null;
    if (typeof citoyen === "object") return citoyen;
    return null;
}

function getCitoyenId(citoyen: string | CitoyenRef | undefined): string | null {
    if (!citoyen) return null;
    if (typeof citoyen === "string") return citoyen;
    return citoyen._id || null;
}

function StatusBadge({ status }: { status: string }) {
    const s = (status || "signale").toLowerCase();
    const config: Record<string, { bg: string; color: string }> = { signale: { bg: "rgba(245,158,11,0.15)", color: COLORS.orange }, valide: { bg: "rgba(112,190,85,0.15)", color: COLORS.green }, en_cours: { bg: "rgba(6,102,140,0.12)", color: COLORS.blue }, collecte: { bg: "rgba(6,102,140,0.2)", color: COLORS.blue }, refuse: { bg: "rgba(176,0,32,0.12)", color: COLORS.danger } };
    const { bg, color } = config[s] || config.signale;
    return <View style={[styles.badge, { backgroundColor: bg }]}><Text style={[styles.badgeText, { color }]}>{STATUT_LABELS[s as keyof typeof STATUT_LABELS] || s}</Text></View>;
}

export default function GestionSignalementsScreen() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<GestionSignalement[]>([]);
    const [villes, setVilles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [selectedVille, setSelectedVille] = useState<string | null>(null);
    const [selectedStatut, setSelectedStatut] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<GestionSignalement | null>(null);
    const [updating, setUpdating] = useState(false);

    async function load() {
        setError("");
        try {
            const [userData, data] = await Promise.all([me(), getGestionSignalements({ ville: selectedVille || undefined, statut: selectedStatut || undefined })]);
            setUser(userData); setItems(data.items); setVilles(data.villes);
        } catch (e: unknown) {
            const err = e as Error;
            setError(err?.message || "Erreur");
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, [selectedVille, selectedStatut]);
    useFocusEffect(useCallback(() => { load(); }, []));
    async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

    async function handleChangeStatus(newStatut: string) {
        if (!selectedItem) return;
        setUpdating(true);
        try {
            await updateSignalementStatut(selectedItem._id, newStatut);
            setItems(prev => prev.map(i => i._id === selectedItem._id ? { ...i, statut: newStatut } : i));
            setModalVisible(false);
            if (newStatut === "valide") Alert.alert("Validé ✅", "Signalement validé avec succès.");
        } catch (e: unknown) {
            const err = e as Error;
            Alert.alert("Erreur", err?.message || "Erreur");
        } finally { setUpdating(false); }
    }

    if (loading) return <View style={[styles.page, styles.center]}><ActivityIndicator size="large" color={COLORS.blue} /></View>;
    const isGestionnaire = user?.role === "gestionnaire";

    return (
        <View style={styles.page}>
            <View style={styles.filtersCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                    <Pressable style={[styles.chip, !selectedStatut && styles.chipActive]} onPress={() => setSelectedStatut(null)}><Text style={[styles.chipText, !selectedStatut && styles.chipTextActive]}>Tous</Text></Pressable>
                    {STATUTS.map(s => <Pressable key={s} style={[styles.chip, selectedStatut === s && styles.chipActive]} onPress={() => setSelectedStatut(s)}><Text style={[styles.chipText, selectedStatut === s && styles.chipTextActive]}>{STATUT_LABELS[s]}</Text></Pressable>)}
                </ScrollView>
                {isGestionnaire && villes.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <Pressable style={[styles.chipSmall, !selectedVille && styles.chipSmallActive]} onPress={() => setSelectedVille(null)}><Text style={[styles.chipSmallText, !selectedVille && styles.chipSmallTextActive]}>Toutes villes</Text></Pressable>
                        {villes.map(v => <Pressable key={v} style={[styles.chipSmall, selectedVille === v && styles.chipSmallActive]} onPress={() => setSelectedVille(v)}><Text style={[styles.chipSmallText, selectedVille === v && styles.chipSmallTextActive]}>{v}</Text></Pressable>)}
                    </ScrollView>
                )}
            </View>
            <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {!!error && <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View>}
                <Text style={styles.countText}>{items.length} signalement{items.length > 1 ? "s" : ""}</Text>
                {items.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyText}>Aucun signalement</Text></View> : items.map(item => {
                    const typeLabel = TYPE_ENCOMBRANT_LABELS[item.typeEncombrant as keyof typeof TYPE_ENCOMBRANT_LABELS] || item.typeEncombrant || "Encombrant";
                    const citoyenData = getCitoyenData(item.citoyen);
                    const citoyenId = getCitoyenId(item.citoyen);
                    return (
                        <View key={item._id} style={styles.card}>
                            <View style={styles.cardHeader}><View style={{ flex: 1 }}><Text style={styles.cardType}>{typeLabel}</Text><Text style={styles.cardDate}>{item.dateSignalement ? new Date(item.dateSignalement).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—"}</Text></View><Pressable onPress={() => { setSelectedItem(item); setModalVisible(true); }}><StatusBadge status={item.statut || "signale"} /></Pressable></View>
                            {!!item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
                            <Text style={styles.cardAddr}>📍 {item.adresse}, {item.ville}</Text>
                            {citoyenData && <Pressable style={styles.citoyenRow} onPress={() => citoyenId && router.push(`/citoyen/${citoyenId}` as Href)}><Text style={styles.citoyenName}>👤 {citoyenData.name || "Citoyen"}</Text><Text style={styles.citoyenPoints}>{citoyenData.pointsTotal || 0} pts</Text></Pressable>}
                            {(item.pointsAttribues || 0) > 0 && <View style={styles.pointsBadge}><Text style={styles.pointsText}>+{item.pointsAttribues} pts</Text></View>}
                            <Pressable style={styles.actionBtn} onPress={() => { setSelectedItem(item); setModalVisible(true); }}><Text style={styles.actionBtnText}>Changer statut</Text></Pressable>
                        </View>
                    );
                })}
            </ScrollView>
            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalBackdrop}><View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Changer le statut</Text>
                    <Text style={styles.modalSubtitle}>{selectedItem?.typeEncombrant} - {selectedItem?.ville}</Text>
                    {STATUTS.map(s => { const isCurrent = selectedItem?.statut === s; return <Pressable key={s} style={[styles.statusOption, isCurrent && { opacity: 0.5 }]} onPress={() => !isCurrent && handleChangeStatus(s)} disabled={updating || isCurrent}><StatusBadge status={s} />{isCurrent && <Text style={styles.currentLabel}>Actuel</Text>}</Pressable>; })}
                    {updating && <ActivityIndicator style={{ marginTop: 10 }} />}
                    <Pressable style={styles.modalCancel} onPress={() => setModalVisible(false)}><Text style={styles.modalCancelText}>Annuler</Text></Pressable>
                </View></View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg }, container: { padding: 16, gap: 12, paddingBottom: 30 }, center: { flex: 1, alignItems: "center", justifyContent: "center" },
    filtersCard: { backgroundColor: COLORS.card, padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: COLORS.bg, marginRight: 8, borderWidth: 1, borderColor: COLORS.border }, chipActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue }, chipText: { fontWeight: "700", color: COLORS.muted }, chipTextActive: { color: "#fff" },
    chipSmall: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: COLORS.bg, marginRight: 6, borderWidth: 1, borderColor: COLORS.border }, chipSmallActive: { backgroundColor: COLORS.green, borderColor: COLORS.green }, chipSmallText: { fontWeight: "600", color: COLORS.muted, fontSize: 12 }, chipSmallTextActive: { color: "#fff" },
    errorCard: { backgroundColor: "rgba(176,0,32,0.1)", padding: 12, borderRadius: 12 }, errorText: { color: COLORS.danger, fontWeight: "700" }, countText: { color: COLORS.muted, fontWeight: "700" },
    emptyCard: { backgroundColor: COLORS.card, padding: 24, borderRadius: 14, alignItems: "center" }, emptyText: { color: COLORS.muted },
    card: { backgroundColor: COLORS.card, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border }, cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, cardType: { fontWeight: "900", color: COLORS.title, fontSize: 15 }, cardDate: { color: COLORS.muted, fontSize: 12, marginTop: 2 }, cardDesc: { marginTop: 8, color: COLORS.text, lineHeight: 18 }, cardAddr: { marginTop: 8, color: COLORS.muted, fontSize: 13 },
    citoyenRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.bg, padding: 10, borderRadius: 10 }, citoyenName: { fontWeight: "700", color: COLORS.title }, citoyenPoints: { fontWeight: "800", color: COLORS.green },
    pointsBadge: { marginTop: 8, backgroundColor: "rgba(112,190,85,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" }, pointsText: { color: COLORS.green, fontWeight: "800", fontSize: 12 },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }, badgeText: { fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
    actionBtn: { marginTop: 12, backgroundColor: COLORS.blue, paddingVertical: 10, borderRadius: 999, alignItems: "center" }, actionBtnText: { color: "#fff", fontWeight: "800" },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }, modalContent: { backgroundColor: "#fff", borderRadius: 18, padding: 20, width: "85%", maxWidth: 340 }, modalTitle: { fontSize: 18, fontWeight: "900", color: COLORS.title, marginBottom: 4 }, modalSubtitle: { color: COLORS.muted, marginBottom: 16 },
    statusOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border }, currentLabel: { color: COLORS.muted, fontSize: 12, fontWeight: "600" }, modalCancel: { marginTop: 16, paddingVertical: 12, alignItems: "center" }, modalCancelText: { color: COLORS.muted, fontWeight: "700" },
});