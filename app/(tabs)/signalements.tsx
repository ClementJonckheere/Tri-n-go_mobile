// app/(tabs)/signalement.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Pressable,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { getSignalements } from "../../src/api/client";
import type { Signalement } from "../../src/types/signalement";
import { TYPE_ENCOMBRANT_LABELS, STATUT_LABELS } from "../../src/types/signalement";

const COLORS = {
    bg: "#F5F7FA",
    card: "#FFFFFF",
    title: "#022B3A",
    text: "#111827",
    muted: "#6b7785",
    border: "#E5E7EB",
    blue: "#06668C",
    green: "#70be55",
    danger: "#B00020",
    orange: "#F59E0B",
};

function StatusBadge({ status }: { status: string }) {
    const s = (status || "signale").toLowerCase();

    const config: Record<string, { bg: string; color: string }> = {
        signale: { bg: "rgba(245,158,11,0.15)", color: COLORS.orange },
        valide: { bg: "rgba(112,190,85,0.15)", color: COLORS.green },
        en_cours: { bg: "rgba(6,102,140,0.12)", color: COLORS.blue },
        collecte: { bg: "rgba(6,102,140,0.2)", color: COLORS.blue },
        refuse: { bg: "rgba(176,0,32,0.12)", color: COLORS.danger },
    };

    const { bg, color } = config[s] || config.signale;
    const label = STATUT_LABELS[s as keyof typeof STATUT_LABELS] || s;

    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
    );
}

export default function SignalementsScreen() {
    const router = useRouter();
    const [items, setItems] = useState<Signalement[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    async function load() {
        try {
            const s = await getSignalements();
            setItems(s || []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    // Recharger quand on revient sur l'écran
    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    async function onRefresh() {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }

    function formatDate(dateStr?: string): string {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    if (loading) {
        return (
            <View style={[styles.page, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.blue} />
                <Text style={styles.loadingText}>Chargement…</Text>
            </View>
        );
    }

    // Grouper par statut pour afficher les stats
    const stats = {
        total: items.length,
        signale: items.filter(i => i.statut === "signale").length,
        valide: items.filter(i => i.statut === "valide").length,
        collecte: items.filter(i => i.statut === "collecte").length,
    };

    return (
        <ScrollView
            style={styles.page}
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text style={styles.pageTitle}>Mes signalements</Text>

            {/* Stats rapides */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: "rgba(245,158,11,0.1)" }]}>
                    <Text style={[styles.statValue, { color: COLORS.orange }]}>{stats.signale}</Text>
                    <Text style={styles.statLabel}>En attente</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: "rgba(112,190,85,0.1)" }]}>
                    <Text style={[styles.statValue, { color: COLORS.green }]}>{stats.valide}</Text>
                    <Text style={styles.statLabel}>Validés</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: "rgba(6,102,140,0.1)" }]}>
                    <Text style={[styles.statValue, { color: COLORS.blue }]}>{stats.collecte}</Text>
                    <Text style={styles.statLabel}>Collectés</Text>
                </View>
            </View>

            {/* Liste */}
            {items.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyTitle}>Aucun signalement</Text>
                    <Text style={styles.emptyText}>
                        Vous n'avez pas encore déclaré d'encombrant
                    </Text>
                    <Pressable
                        style={styles.emptyBtn}
                        onPress={() => router.push("/(tabs)/new-signalement")}
                    >
                        <Text style={styles.emptyBtnText}>Créer mon premier signalement</Text>
                    </Pressable>
                </View>
            ) : (
                items.map((s) => {
                    const typeLabel = TYPE_ENCOMBRANT_LABELS[s.typeEncombrant as keyof typeof TYPE_ENCOMBRANT_LABELS]
                        ?? s.typeEncombrant
                        ?? "Encombrant";

                    return (
                        <Pressable
                            key={s._id}
                            style={styles.card}
                            onPress={() => router.push(`/(tabs)/signalement/${s._id}`)}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{typeLabel}</Text>
                                <StatusBadge status={s.statut ?? "signale"} />
                            </View>

                            {!!s.description && (
                                <Text style={styles.cardDesc} numberOfLines={2}>
                                    {s.description}
                                </Text>
                            )}

                            <View style={styles.cardFooter}>
                                <Text style={styles.cardMeta}>
                                    📍 {s.ville || s.adresse || "—"}
                                </Text>
                                <Text style={styles.cardDate}>
                                    {formatDate(s.dateSignalement || s.createdAt)}
                                </Text>
                            </View>

                            {s.pointsAttribues !== undefined && s.pointsAttribues > 0 && (
                                <View style={styles.pointsBadge}>
                                    <Text style={styles.pointsText}>+{s.pointsAttribues} pts</Text>
                                </View>
                            )}
                        </Pressable>
                    );
                })
            )}

            {/* Bouton nouveau */}
            {items.length > 0 && (
                <Pressable
                    style={styles.newBtn}
                    onPress={() => router.push("/(tabs)/new-signalement")}
                >
                    <Text style={styles.newBtnText}>➕ Nouveau signalement</Text>
                </Pressable>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg },
    container: { padding: 16, gap: 12, paddingBottom: 30 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 10, color: COLORS.muted },

    pageTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 4,
    },

    // Stats
    statsRow: {
        flexDirection: "row",
        gap: 8,
    },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.title,
    },
    statLabel: {
        fontSize: 10,
        color: COLORS.muted,
        fontWeight: "700",
        marginTop: 2,
    },

    // Card
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
    },
    cardTitle: {
        flex: 1,
        fontWeight: "900",
        color: COLORS.title,
        fontSize: 15,
    },
    cardDesc: {
        marginTop: 8,
        color: COLORS.text,
        lineHeight: 20,
    },
    cardFooter: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardMeta: {
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: "600",
    },
    cardDate: {
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: "600",
    },

    // Badge
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
    },

    // Points badge
    pointsBadge: {
        marginTop: 10,
        backgroundColor: "rgba(112,190,85,0.12)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    pointsText: {
        color: COLORS.green,
        fontWeight: "800",
        fontSize: 12,
    },

    // Empty state
    emptyCard: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.title,
    },
    emptyText: {
        marginTop: 6,
        color: COLORS.muted,
        textAlign: "center",
    },
    emptyBtn: {
        marginTop: 16,
        backgroundColor: COLORS.green,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 999,
    },
    emptyBtnText: {
        color: "#fff",
        fontWeight: "800",
    },

    // New button
    newBtn: {
        marginTop: 4,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: COLORS.green,
        shadowColor: COLORS.green,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    newBtnText: {
        color: "#fff",
        fontWeight: "900",
    },
});