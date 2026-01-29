// app/(tabs)/signalement/[id].tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getSignalement } from "../../../src/api/client";
import type { Signalement } from "../../../src/types/signalement";
import { TYPE_ENCOMBRANT_LABELS, STATUT_LABELS } from "../../../src/types/signalement";
import { API_BASE_URL } from "../../../src/config";

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
        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
            <Text style={[styles.statusText, { color }]}>{label}</Text>
        </View>
    );
}

export default function SignalementDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [item, setItem] = useState<Signalement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function load() {
        if (!id) {
            setError("ID manquant");
            setLoading(false);
            return;
        }

        setError("");
        setLoading(true);

        try {
            const data = await getSignalement(id);
            setItem(data);
        } catch (e: any) {
            setError(e?.message || "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [id]);

    if (loading) {
        return (
            <View style={[styles.page, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.blue} />
                <Text style={styles.loadingText}>Chargement…</Text>
            </View>
        );
    }

    if (error || !item) {
        return (
            <View style={[styles.page, styles.center]}>
                <Text style={styles.errorTitle}>⚠️ Erreur</Text>
                <Text style={styles.errorText}>{error || "Signalement introuvable"}</Text>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>Retour</Text>
                </Pressable>
            </View>
        );
    }

    const typeLabel = TYPE_ENCOMBRANT_LABELS[item.typeEncombrant as keyof typeof TYPE_ENCOMBRANT_LABELS]
        ?? item.typeEncombrant
        ?? "Encombrant";

    const dateStr = item.dateSignalement
        ? new Date(item.dateSignalement).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "—";

    // URL de la photo (si disponible)
    const photoUrl = item.photoFilename
        ? `${API_BASE_URL.replace("/api/v1", "")}/uploads/${item.photoFilename}`
        : null;

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backLink}>
                    <Text style={styles.backLinkText}>← Retour</Text>
                </Pressable>
            </View>

            {/* Photo */}
            {photoUrl && (
                <Image
                    source={{ uri: photoUrl }}
                    style={styles.photo}
                    resizeMode="cover"
                />
            )}

            {/* Infos principales */}
            <View style={styles.card}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{typeLabel}</Text>
                    <StatusBadge status={item.statut ?? "signale"} />
                </View>

                {!!item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                )}

                <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>📍 Localisation</Text>
                    <Text style={styles.metaValue}>
                        {item.adresse || "—"}
                    </Text>
                    <Text style={styles.metaValue}>
                        {item.codePostal} {item.ville}
                    </Text>
                </View>

                <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>📅 Date du signalement</Text>
                    <Text style={styles.metaValue}>{dateStr}</Text>
                </View>

                {item.pointsAttribues !== undefined && item.pointsAttribues > 0 && (
                    <View style={styles.pointsSection}>
                        <Text style={styles.pointsLabel}>🎁 Points gagnés</Text>
                        <Text style={styles.pointsValue}>+{item.pointsAttribues} pts</Text>
                    </View>
                )}
            </View>

            {/* Coordonnées GPS */}
            {item.lat && item.lon && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Coordonnées GPS</Text>
                    <Text style={styles.gpsText}>
                        Lat: {item.lat.toFixed(6)} | Lon: {item.lon.toFixed(6)}
                    </Text>
                    <Pressable
                        style={styles.mapBtn}
                        onPress={() => router.push("/(tabs)/map")}
                    >
                        <Text style={styles.mapBtnText}>Voir sur la carte</Text>
                    </Pressable>
                </View>
            )}

            {/* Timeline des statuts (si disponible) */}
            {/* À implémenter si l'API retourne l'historique */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg },
    container: { paddingBottom: 30 },
    center: { alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 10, color: COLORS.muted },

    // Header
    header: {
        padding: 16,
    },
    backLink: {},
    backLinkText: {
        color: COLORS.blue,
        fontWeight: "800",
    },

    // Photo
    photo: {
        width: "100%",
        height: 220,
        backgroundColor: COLORS.border,
    },

    // Card
    card: {
        backgroundColor: COLORS.card,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 10,
    },

    // Title row
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: "900",
        color: COLORS.title,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "900",
        textTransform: "uppercase",
    },

    // Description
    description: {
        marginTop: 14,
        color: COLORS.text,
        lineHeight: 22,
        fontSize: 15,
    },

    // Meta
    metaSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    metaLabel: {
        color: COLORS.muted,
        fontWeight: "700",
        fontSize: 13,
        marginBottom: 6,
    },
    metaValue: {
        color: COLORS.text,
        fontWeight: "600",
        fontSize: 15,
    },

    // Points
    pointsSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pointsLabel: {
        color: COLORS.muted,
        fontWeight: "700",
    },
    pointsValue: {
        color: COLORS.green,
        fontWeight: "900",
        fontSize: 18,
    },

    // GPS
    gpsText: {
        color: COLORS.muted,
        fontFamily: "monospace",
        fontSize: 13,
    },
    mapBtn: {
        marginTop: 12,
        backgroundColor: COLORS.blue,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    mapBtnText: {
        color: "#fff",
        fontWeight: "800",
    },

    // Errors
    errorTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.danger,
        marginBottom: 8,
    },
    errorText: {
        color: COLORS.danger,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 16,
    },
    backBtn: {
        backgroundColor: COLORS.blue,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 999,
    },
    backBtnText: {
        color: "#fff",
        fontWeight: "800",
    },
});