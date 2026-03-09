// app/(tabs)/signalement/[id].tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
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
import { COLORS, getStatusColor, getStatusBgColor } from "../../../src/styles";
import { signalementDetailStyles as styles } from "../../../src/styles/signalementDetailStyles";

function StatusBadge({ status }: { status: string }) {
    const s = (status || "signale").toLowerCase();
    const bg = getStatusBgColor(s);
    const color = getStatusColor(s);
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
                <Text style={styles.errorTitle}>Erreur</Text>
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

            <View style={styles.card}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{typeLabel}</Text>
                    <StatusBadge status={item.statut ?? "signale"} />
                </View>

                {!!item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                )}

                <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>Localisation</Text>
                    <Text style={styles.metaValue}>
                        {item.adresse || "—"}
                    </Text>
                    <Text style={styles.metaValue}>
                        {item.codePostal} {item.ville}
                    </Text>
                </View>

                <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>Date du signalement</Text>
                    <Text style={styles.metaValue}>{dateStr}</Text>
                </View>

                {item.pointsAttribues !== undefined && item.pointsAttribues > 0 && (
                    <View style={styles.pointsSection}>
                        <Text style={styles.pointsLabel}>Points gagnés</Text>
                        <Text style={styles.pointsValue}>+{item.pointsAttribues} pts</Text>
                    </View>
                )}
            </View>

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
        </ScrollView>
    );
}