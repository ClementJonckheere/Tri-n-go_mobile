// app/(tabs)/map.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable, RefreshControl, ScrollView } from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter, type Href } from "expo-router";

import { getSignalements, geocode } from "../../src/api/client";
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
    orange: "#F59E0B",
    purple: "#7C3AED",
};

// Couleur du marker selon le statut
function getMarkerColor(statut?: string): string {
    switch (statut?.toLowerCase()) {
        case "valide":
            return COLORS.green;
        case "en_cours":
            return COLORS.purple;
        case "collecte":
            return COLORS.blue;
        case "refuse":
            return COLORS.danger;
        default:
            return COLORS.orange; // orange pour "signalé"
    }
}

type Position = {
    latitude: number;
    longitude: number;
};

type SignalementWithCoords = Signalement & {
    latitude: number;
    longitude: number;
};

// Cache pour les géocodages (évite de refaire les mêmes requêtes)
const geocodeCache: Record<string, { lat: number; lon: number } | null> = {};

export default function MapScreen() {
    const router = useRouter();
    const [position, setPosition] = useState<Position | null>(null);
    const [items, setItems] = useState<SignalementWithCoords[]>([]);
    const [loading, setLoading] = useState(true);
    const [geocoding, setGeocoding] = useState(false);
    const [error, setError] = useState<string>("");
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [region, setRegion] = useState<Region | null>(null);

    // Géocoder une adresse
    async function geocodeAddress(adresse: string, ville: string, codePostal: string): Promise<{ lat: number; lon: number } | null> {
        const cacheKey = `${adresse}|${ville}|${codePostal}`;

        // Vérifier le cache
        if (cacheKey in geocodeCache) {
            return geocodeCache[cacheKey];
        }

        try {
            const result = await geocode(adresse, ville, codePostal);
            if (result) {
                geocodeCache[cacheKey] = { lat: result.lat, lon: result.lon };
                return { lat: result.lat, lon: result.lon };
            }
        } catch {
            // Ignorer les erreurs de géocodage
        }

        geocodeCache[cacheKey] = null;
        return null;
    }

    async function load() {
        setError("");
        setLoading(true);

        try {
            // 🔐 Permission GPS
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                // Utiliser une position par défaut (Amiens)
                setPosition({ latitude: 49.894067, longitude: 2.295753 });
            } else {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setPosition({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
            }

            // 📦 Signalements
            const signalements = await getSignalements();

            // Traiter les signalements
            setGeocoding(true);
            const itemsWithCoords: SignalementWithCoords[] = [];

            for (const s of signalements) {
                // Si le signalement a déjà des coordonnées valides
                if (s.lat && s.lon && typeof s.lat === "number" && typeof s.lon === "number" && !isNaN(s.lat) && !isNaN(s.lon)) {
                    itemsWithCoords.push({
                        ...s,
                        latitude: s.lat,
                        longitude: s.lon,
                    });
                }
                // Sinon, essayer de géocoder l'adresse
                else if (s.adresse && s.ville) {
                    const coords = await geocodeAddress(s.adresse, s.ville, s.codePostal || "");
                    if (coords) {
                        itemsWithCoords.push({
                            ...s,
                            latitude: coords.lat,
                            longitude: coords.lon,
                        });
                    }
                }
            }

            setItems(itemsWithCoords);
            setGeocoding(false);

            // Ajuster la région pour voir tous les markers
            if (itemsWithCoords.length > 0) {
                const lats = itemsWithCoords.map(i => i.latitude);
                const lons = itemsWithCoords.map(i => i.longitude);
                const minLat = Math.min(...lats);
                const maxLat = Math.max(...lats);
                const minLon = Math.min(...lons);
                const maxLon = Math.max(...lons);

                setRegion({
                    latitude: (minLat + maxLat) / 2,
                    longitude: (minLon + maxLon) / 2,
                    latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.5),
                    longitudeDelta: Math.max(0.02, (maxLon - minLon) * 1.5),
                });
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    // Recharger quand l'écran devient actif
    useFocusEffect(
        useCallback(() => {
            // Ne pas recharger si déjà en cours
            if (!loading) {
                load();
            }
        }, [])
    );

    // Filtrer les items selon le statut sélectionné
    const filteredItems = selectedFilter
        ? items.filter(s => s.statut === selectedFilter)
        : items;

    // Compter par statut
    const counts = {
        all: items.length,
        signale: items.filter(s => s.statut === "signale").length,
        valide: items.filter(s => s.statut === "valide").length,
        en_cours: items.filter(s => s.statut === "en_cours").length,
        collecte: items.filter(s => s.statut === "collecte").length,
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.blue} />
                <Text style={styles.loadingText}>
                    {geocoding ? "Géolocalisation des adresses…" : "Chargement de la carte…"}
                </Text>
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

    const initialRegion = region || (position ? {
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : {
        latitude: 49.894067,
        longitude: 2.295753,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    return (
        <View style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Mes encombrants</Text>
                <Text style={styles.subtitle}>
                    {filteredItems.length} de mes signalement{filteredItems.length > 1 ? "s" : ""} sur la carte
                </Text>
            </View>

            {/* Filtres */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
                    <Pressable
                        style={[styles.filterChip, !selectedFilter && styles.filterChipActive]}
                        onPress={() => setSelectedFilter(null)}
                    >
                        <View style={[styles.filterDot, { backgroundColor: COLORS.muted }]} />
                        <Text style={[styles.filterText, !selectedFilter && styles.filterTextActive]}>
                            Tous ({counts.all})
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.filterChip, selectedFilter === "signale" && styles.filterChipActive]}
                        onPress={() => setSelectedFilter(selectedFilter === "signale" ? null : "signale")}
                    >
                        <View style={[styles.filterDot, { backgroundColor: COLORS.orange }]} />
                        <Text style={[styles.filterText, selectedFilter === "signale" && styles.filterTextActive]}>
                            Signalés ({counts.signale})
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.filterChip, selectedFilter === "valide" && styles.filterChipActive]}
                        onPress={() => setSelectedFilter(selectedFilter === "valide" ? null : "valide")}
                    >
                        <View style={[styles.filterDot, { backgroundColor: COLORS.green }]} />
                        <Text style={[styles.filterText, selectedFilter === "valide" && styles.filterTextActive]}>
                            Validés ({counts.valide})
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.filterChip, selectedFilter === "en_cours" && styles.filterChipActive]}
                        onPress={() => setSelectedFilter(selectedFilter === "en_cours" ? null : "en_cours")}
                    >
                        <View style={[styles.filterDot, { backgroundColor: COLORS.purple }]} />
                        <Text style={[styles.filterText, selectedFilter === "en_cours" && styles.filterTextActive]}>
                            En cours ({counts.en_cours})
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.filterChip, selectedFilter === "collecte" && styles.filterChipActive]}
                        onPress={() => setSelectedFilter(selectedFilter === "collecte" ? null : "collecte")}
                    >
                        <View style={[styles.filterDot, { backgroundColor: COLORS.blue }]} />
                        <Text style={[styles.filterText, selectedFilter === "collecte" && styles.filterTextActive]}>
                            Collectés ({counts.collecte})
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>

            {/* Map */}
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton
            >
                {filteredItems.map((s) => (
                    <Marker
                        key={s._id}
                        coordinate={{
                            latitude: s.latitude,
                            longitude: s.longitude,
                        }}
                        pinColor={getMarkerColor(s.statut)}
                    >
                        <Callout
                            onPress={() => router.push(`/signalement/${s._id}` as Href)}
                        >
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>
                                    {TYPE_ENCOMBRANT_LABELS[s.typeEncombrant as keyof typeof TYPE_ENCOMBRANT_LABELS] ??
                                        s.typeEncombrant ??
                                        "Encombrant"}
                                </Text>
                                <View style={[styles.calloutBadge, { backgroundColor: getMarkerColor(s.statut) + "20" }]}>
                                    <Text style={[styles.calloutStatus, { color: getMarkerColor(s.statut) }]}>
                                        {STATUT_LABELS[s.statut as keyof typeof STATUT_LABELS] ?? s.statut ?? "Signalé"}
                                    </Text>
                                </View>
                                {!!s.description && (
                                    <Text style={styles.calloutDesc} numberOfLines={2}>
                                        {s.description}
                                    </Text>
                                )}
                                <Text style={styles.calloutAddr}>
                                    📍 {s.adresse ?? ""}{s.ville ? `, ${s.ville}` : ""}
                                </Text>
                                <Text style={styles.calloutHint}>Appuyer pour voir les détails →</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Légende */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.orange }]} />
                    <Text style={styles.legendText}>Signalé</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.green }]} />
                    <Text style={styles.legendText}>Validé</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.purple }]} />
                    <Text style={styles.legendText}>En cours</Text>
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

    // Filtres
    filtersContainer: {
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    filters: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        flexDirection: "row",
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 6,
    },
    filterChipActive: {
        backgroundColor: COLORS.title,
        borderColor: COLORS.title,
    },
    filterDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
    },
    filterText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.muted,
    },
    filterTextActive: {
        color: "#fff",
    },

    map: { flex: 1 },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: COLORS.bg,
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
        width: 200,
        padding: 6,
    },
    calloutTitle: {
        fontWeight: "900",
        color: COLORS.title,
        fontSize: 14,
        marginBottom: 6,
    },
    calloutBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        marginBottom: 6,
    },
    calloutStatus: {
        fontWeight: "800",
        fontSize: 11,
        textTransform: "uppercase",
    },
    calloutDesc: {
        color: COLORS.text,
        fontSize: 12,
        marginBottom: 6,
        lineHeight: 16,
    },
    calloutAddr: {
        color: COLORS.muted,
        fontSize: 11,
        marginBottom: 6,
    },
    calloutHint: {
        color: COLORS.blue,
        fontSize: 10,
        fontWeight: "700",
    },

    // Légende
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        flexWrap: "wrap",
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
    },
    legendText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.muted,
    },
});