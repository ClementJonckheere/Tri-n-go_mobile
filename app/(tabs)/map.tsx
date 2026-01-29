// app/(tabs)/map.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";

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
    danger: "#B00020",
    green: "#70be55",
    blue: "#06668C",
};

// Couleur du marker selon le statut
function getMarkerColor(statut?: string): string {
    switch (statut?.toLowerCase()) {
        case "valide":
            return COLORS.green;
        case "collecte":
            return COLORS.blue;
        case "refuse":
            return COLORS.danger;
        default:
            return "#FFA500"; // orange pour "signalé"
    }
}

type Position = {
    latitude: number;
    longitude: number;
};

export default function MapScreen() {
    const [position, setPosition] = useState<Position | null>(null);
    const [items, setItems] = useState<Signalement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    async function load() {
        setError("");
        setLoading(true);

        try {
            // 🔐 Permission GPS
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setError("Permission de localisation refusée");
                setLoading(false);
                return;
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setPosition({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });

            // 📦 Signalements
            const s = await getSignalements();
            setItems(s || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    // Filtrer les signalement qui ont des coordonnées valides
    const itemsWithCoords = items.filter(
        (s) =>
            s.lat !== null &&
            s.lat !== undefined &&
            s.lon !== null &&
            s.lon !== undefined &&
            typeof s.lat === "number" &&
            typeof s.lon === "number" &&
            !isNaN(s.lat) &&
            !isNaN(s.lon)
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.blue} />
                <Text style={styles.loadingText}>Chargement de la carte…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorTitle}>⚠️ Erreur</Text>
                <Text style={styles.error}>{error}</Text>
                <Pressable style={styles.retryBtn} onPress={load}>
                    <Text style={styles.retryText}>Réessayer</Text>
                </Pressable>
            </View>
        );
    }

    if (!position) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Position indisponible</Text>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Carte des encombrants</Text>
                <Text style={styles.subtitle}>
                    {itemsWithCoords.length} signalement{itemsWithCoords.length > 1 ? "s" : ""} sur la carte
                </Text>
            </View>

            {/* Map */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: position.latitude,
                    longitude: position.longitude,
                    latitudeDelta: 0.025,
                    longitudeDelta: 0.025,
                }}
                showsUserLocation
                showsMyLocationButton
            >
                {itemsWithCoords.map((s) => (
                    <Marker
                        key={s._id}
                        coordinate={{
                            latitude: s.lat as number,
                            longitude: s.lon as number,
                        }}
                        pinColor={getMarkerColor(s.statut)}
                    >
                        <Callout>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>
                                    {TYPE_ENCOMBRANT_LABELS[s.typeEncombrant as keyof typeof TYPE_ENCOMBRANT_LABELS] ??
                                        s.typeEncombrant ??
                                        "Encombrant"}
                                </Text>
                                <Text style={styles.calloutStatus}>
                                    {STATUT_LABELS[s.statut as keyof typeof STATUT_LABELS] ?? s.statut ?? "Signalé"}
                                </Text>
                                {!!s.description && (
                                    <Text style={styles.calloutDesc} numberOfLines={2}>
                                        {s.description}
                                    </Text>
                                )}
                                <Text style={styles.calloutAddr}>
                                    {s.adresse ?? ""} {s.ville ?? ""}
                                </Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Légende */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#FFA500" }]} />
                    <Text style={styles.legendText}>Signalé</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.green }]} />
                    <Text style={styles.legendText}>Validé</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.blue }]} />
                    <Text style={styles.legendText}>Collecté</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg },

    header: {
        padding: 14,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.title,
    },
    subtitle: {
        marginTop: 2,
        color: COLORS.muted,
        fontWeight: "600",
        fontSize: 13,
    },

    map: { flex: 1 },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.muted,
        fontWeight: "600",
    },

    errorTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.danger,
        marginBottom: 8,
    },
    error: {
        color: COLORS.danger,
        fontWeight: "600",
        textAlign: "center",
    },
    retryBtn: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: COLORS.blue,
        borderRadius: 999,
    },
    retryText: {
        color: "#fff",
        fontWeight: "800",
    },

    // Callout (bulle info)
    callout: {
        width: 180,
        padding: 4,
    },
    calloutTitle: {
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 4,
    },
    calloutStatus: {
        fontWeight: "700",
        color: COLORS.blue,
        fontSize: 12,
        marginBottom: 4,
    },
    calloutDesc: {
        color: COLORS.text,
        fontSize: 12,
        marginBottom: 4,
    },
    calloutAddr: {
        color: COLORS.muted,
        fontSize: 11,
    },

    // Légende
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
        padding: 10,
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 999,
    },
    legendText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.muted,
    },
});
