// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import type { User } from "../../src/types/user";
import type { Signalement } from "../../src/types/signalement";
import {
    me,
    getSignalements,
    logout,
    getPointsInfo,
    type PointsInfo
} from "../../src/api/client";
import { TYPE_ENCOMBRANT_LABELS, STATUT_LABELS } from "../../src/types/signalement";
import { COLORS, getStatusColor, getStatusBgColor } from "../../src/styles";
import { homeStyles as styles } from "../../src/styles/homeStyles";

// Badge statut
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

function ProgressBar({ progress }: { progress: number }) {
    const width = Math.min(100, Math.max(0, progress));
    return (
        <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${width}%` }]} />
        </View>
    );
}

export default function DashboardCitoyen() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<Signalement[]>([]);
    const [pointsInfo, setPointsInfo] = useState<PointsInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    async function load() {
        setError("");
        try {
            const [u, s, p] = await Promise.all([
                me(),
                getSignalements(),
                getPointsInfo().catch(() => null),
            ]);
            setUser(u);
            setItems(s || []);
            setPointsInfo(p);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

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

    async function onLogout() {
        await logout();
        router.replace("/(auth)/login");
    }

    const last5 = useMemo(() => items.slice(0, 5), [items]);

    // Utiliser pointsInfo si dispo
    const points = pointsInfo?.pointsTotal ?? user?.pointsTotal ?? 0;
    const cashbackRate = pointsInfo?.cashbackRate ?? 0.05;
    const cashbackValue = pointsInfo?.cashbackValue ?? points * cashbackRate;
    const nextPalier = pointsInfo?.nextPalier ?? 100;
    const progression = pointsInfo?.progression ?? 0;

    if (loading) {
        return (
            <View style={[styles.page, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.blue} />
                <Text style={styles.loadingText}>Chargement…</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.page}
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {!!error && (
                <View style={styles.errorCard}>
                    <Text style={styles.errorTitle}>Erreur</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable onPress={load} style={styles.retryBtn}>
                        <Text style={styles.retryBtnText}>Réessayer</Text>
                    </Pressable>
                </View>
            )}

            <View style={styles.pointsCard}>
                <View style={styles.pointsHeader}>
                    <Text style={styles.pointsLabel}>Mes points Tri'n Go</Text>
                    <Pressable onPress={() => router.push("/(tabs)/points")}>
                        <Text style={styles.pointsLink}>Utiliser →</Text>
                    </Pressable>
                </View>

                <Text style={styles.pointsValue}>{points} pts</Text>

                <View style={styles.progressSection}>
                    <ProgressBar progress={progression} />
                    <Text style={styles.progressText}>
                        Prochain palier : <Text style={styles.bold}>{nextPalier} pts</Text>
                    </Text>
                </View>

                <View style={styles.cashbackRow}>
                    <Text style={styles.cashbackLabel}>Valeur cashback :</Text>
                    <Text style={styles.cashbackValue}>{cashbackValue.toFixed(2)} €</Text>
                </View>
                <Text style={styles.cashbackRate}>
                    Taux actuel : {(cashbackRate * 100).toFixed(0)} centimes / 100 pts
                </Text>
            </View>

            <Pressable
                style={styles.ctaBtn}
                onPress={() => router.push("/(tabs)/new-signalement")}
            >
                <Text style={styles.ctaIcon}>📦</Text>
                <View style={styles.ctaTextWrap}>
                    <Text style={styles.ctaTitle}>Déclarer un encombrant</Text>
                    <Text style={styles.ctaSubtitle}>
                        Prenez une photo et gagnez des points
                    </Text>
                </View>
                <Text style={styles.ctaArrow}>→</Text>
            </Pressable>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Derniers signalements</Text>
                    <Pressable onPress={() => router.push("/(tabs)/signalements")}>
                        <Text style={styles.cardLink}>Voir tout</Text>
                    </Pressable>
                </View>

                {last5.length === 0 ? (
                    <Text style={styles.empty}>
                        Vous n'avez pas encore déclaré d'encombrant
                    </Text>
                ) : (
                    last5.map((s, i) => (
                        <View
                            key={s._id}
                            style={[
                                styles.signalRow,
                                i === 0 && { borderTopWidth: 0 }
                            ]}
                        >
                            <View style={styles.signalInfo}>
                                <Text style={styles.signalType} numberOfLines={1}>
                                    {TYPE_ENCOMBRANT_LABELS[s.typeEncombrant as keyof typeof TYPE_ENCOMBRANT_LABELS] ??
                                        s.typeEncombrant ?? "Encombrant"}
                                </Text>
                                <Text style={styles.signalAddr} numberOfLines={1}>
                                    {s.adresse || s.ville || "—"}
                                </Text>
                            </View>
                            <StatusBadge status={s.statut ?? "signale"} />
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}