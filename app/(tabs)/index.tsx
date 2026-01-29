// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    Image,
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

const COLORS = {
    bg: "#F5F7FA",
    card: "#FFFFFF",
    title: "#022B3A",
    text: "#111827",
    muted: "#6b7785",
    border: "#E5E7EB",
    blue: "#06668C",
    green: "#70be55",
    greenLight: "rgba(112,190,85,0.15)",
    danger: "#B00020",
    orange: "#F59E0B",
};

// Badge statut
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

// Barre de progression
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
                getPointsInfo().catch(() => null), // fallback si route pas encore dispo
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

    // Charger au premier rendu
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

    async function onLogout() {
        await logout();
        router.replace("/(auth)/login");
    }

    const last5 = useMemo(() => items.slice(0, 5), [items]);

    // Utiliser pointsInfo si dispo, sinon fallback sur user.pointsTotal
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
            {/* HERO */}
            <View style={styles.hero}>
                <Image
                    source={require("../../assets/images/ordure.png")}
                    style={styles.heroImg}
                    resizeMode="contain"
                />
                <View style={styles.heroTextWrap}>
                    <Text style={styles.heroHello}>Bonjour {user?.name ?? ""} 👋</Text>
                    <Text style={styles.heroText}>
                        Merci de contribuer à une ville plus propre
                    </Text>
                </View>
            </View>

            {/* ERREUR */}
            {!!error && (
                <View style={styles.errorCard}>
                    <Text style={styles.errorTitle}>⚠️ Erreur</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable onPress={load} style={styles.retryBtn}>
                        <Text style={styles.retryBtnText}>Réessayer</Text>
                    </Pressable>
                </View>
            )}

            {/* POINTS CARD */}
            <View style={styles.pointsCard}>
                <View style={styles.pointsHeader}>
                    <Text style={styles.pointsLabel}>Mes points Tri'n Go</Text>
                    <Pressable onPress={() => router.push("/(tabs)/points")}>
                        <Text style={styles.pointsLink}>Utiliser →</Text>
                    </Pressable>
                </View>

                <Text style={styles.pointsValue}>{points} pts</Text>

                {/* Barre de progression */}
                <View style={styles.progressSection}>
                    <ProgressBar progress={progression} />
                    <Text style={styles.progressText}>
                        Prochain palier : <Text style={styles.bold}>{nextPalier} pts</Text>
                    </Text>
                </View>

                {/* Cashback */}
                <View style={styles.cashbackRow}>
                    <Text style={styles.cashbackLabel}>
                        Valeur cashback :
                    </Text>
                    <Text style={styles.cashbackValue}>
                        {cashbackValue.toFixed(2)} €
                    </Text>
                </View>
                <Text style={styles.cashbackRate}>
                    Taux actuel : {(cashbackRate * 100).toFixed(0)} centimes / 100 pts
                </Text>
            </View>

            {/* CTA NOUVEAU SIGNALEMENT */}
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

            {/* DERNIERS SIGNALEMENTS */}
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

            {/* ÉCO-GESTES */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>🌱 Éco-gestes utiles</Text>
                <View style={styles.ecoList}>
                    <Text style={styles.ecoItem}>
                        • Déposez vos encombrants le jour de collecte
                    </Text>
                    <Text style={styles.ecoItem}>
                        • Donnez les objets encore utilisables à une association
                    </Text>
                    <Text style={styles.ecoItem}>
                        • Privilégiez le réemploi et la réparation
                    </Text>
                </View>
            </View>

            {/* PROFIL & DÉCONNEXION */}
            <View style={styles.bottomActions}>
                <Pressable
                    style={styles.profileBtn}
                    onPress={() => router.push("/(tabs)/profile")}
                >
                    <Text style={styles.profileBtnText}>👤 Mon profil</Text>
                </Pressable>

                <Pressable style={styles.logoutBtn} onPress={onLogout}>
                    <Text style={styles.logoutBtnText}>Se déconnecter</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg },
    container: { padding: 16, gap: 14, paddingBottom: 30 },
    center: { alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 10, color: COLORS.muted, fontWeight: "600" },

    // Hero
    hero: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    heroImg: { width: 56, height: 56 },
    heroTextWrap: { flex: 1 },
    heroHello: { fontSize: 18, fontWeight: "900", color: COLORS.title },
    heroText: { marginTop: 4, color: COLORS.muted, fontWeight: "600", fontSize: 13 },

    // Erreur
    errorCard: {
        backgroundColor: "rgba(176,0,32,0.08)",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(176,0,32,0.2)",
    },
    errorTitle: { fontWeight: "900", color: COLORS.danger },
    errorText: { marginTop: 6, color: COLORS.danger },
    retryBtn: {
        marginTop: 12,
        backgroundColor: COLORS.danger,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    retryBtnText: { color: "#fff", fontWeight: "800" },

    // Points Card
    pointsCard: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pointsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pointsLabel: { color: COLORS.muted, fontWeight: "800", fontSize: 13 },
    pointsLink: { color: COLORS.blue, fontWeight: "800", fontSize: 13 },
    pointsValue: {
        marginTop: 8,
        fontSize: 32,
        fontWeight: "900",
        color: COLORS.title
    },

    // Progression
    progressSection: { marginTop: 14 },
    progressBg: {
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 999,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: COLORS.green,
        borderRadius: 999,
    },
    progressText: { marginTop: 6, fontSize: 12, color: COLORS.muted },
    bold: { fontWeight: "800" },

    // Cashback
    cashbackRow: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
    },
    cashbackLabel: { color: COLORS.muted, fontWeight: "600", fontSize: 13 },
    cashbackValue: { color: COLORS.green, fontWeight: "900", fontSize: 16 },
    cashbackRate: {
        marginTop: 4,
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: "600",
    },

    // CTA
    ctaBtn: {
        backgroundColor: COLORS.green,
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: COLORS.green,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    ctaIcon: { fontSize: 28 },
    ctaTextWrap: { flex: 1 },
    ctaTitle: { color: "#fff", fontWeight: "900", fontSize: 15 },
    ctaSubtitle: { color: "rgba(255,255,255,0.85)", fontWeight: "600", fontSize: 12, marginTop: 2 },
    ctaArrow: { color: "#fff", fontSize: 20, fontWeight: "900" },

    // Card générique
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    cardTitle: { fontSize: 15, fontWeight: "900", color: COLORS.title },
    cardLink: { color: COLORS.blue, fontWeight: "800", fontSize: 13 },

    // Signalements
    signalRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    signalInfo: { flex: 1 },
    signalType: { color: COLORS.text, fontWeight: "800" },
    signalAddr: { color: COLORS.muted, fontSize: 12, marginTop: 2 },

    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    badgeText: { fontSize: 11, fontWeight: "900", textTransform: "uppercase" },

    empty: { color: COLORS.muted, fontWeight: "600", fontStyle: "italic" },

    // Éco-gestes
    ecoList: { marginTop: 8, gap: 6 },
    ecoItem: { color: COLORS.text, fontWeight: "600", lineHeight: 20 },

    // Bottom actions
    bottomActions: { gap: 10, marginTop: 6 },
    profileBtn: {
        backgroundColor: COLORS.blue,
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: "center",
    },
    profileBtnText: { color: "#fff", fontWeight: "900" },
    logoutBtn: {
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#fff",
    },
    logoutBtnText: { color: COLORS.muted, fontWeight: "800" },
});