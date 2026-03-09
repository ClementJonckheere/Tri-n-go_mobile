// app/(tabs)/signalements.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
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
import { COLORS, getStatusColor, getStatusBgColor } from "../../src/styles";
import { signalementListStyles as styles } from "../../src/styles/signalementListStyles";

function StatusBadge({ status }: { status: string }) {
    const s = (status || "signale").toLowerCase();
    const bg = getStatusBgColor(s);
    const color = getStatusColor(s);
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