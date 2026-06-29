// app/(tabs-agent)/map.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    Pressable,
    ScrollView,
    Image,
} from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter, useLocalSearchParams, type Href } from "expo-router";
import { getSignalements, geocode, me } from "../../src/api/client";
import type { Signalement, CitoyenRef } from "../../src/types/signalement";
import { TYPE_ENCOMBRANT_LABELS, STATUT_LABELS } from "../../src/types/signalement";
import type { User } from "../../src/types/user";
import { BACKEND_URL } from "../../src/config";
import { COLORS, getStatusColor } from "../../src/styles";
import { mapStyles as styles } from "../../src/styles/mapStyles";

type Position = { latitude: number; longitude: number };
type SignalementWithCoords = Signalement & { latitude: number; longitude: number };

const geocodeCache: Record<string, { lat: number; lon: number } | null> = {};

// Composant Marker personnalisé avec image
function CustomMarker({ item, isFocused }: { item: SignalementWithCoords; isFocused: boolean }) {
    const color = getStatusColor(item.statut);
    const hasPhoto = !!item.photoFilename;
    const photoUrl = hasPhoto ? `${BACKEND_URL}/uploads/${item.photoFilename}` : null;

    return (
        <View style={[styles.markerContainer, isFocused && styles.markerFocused]}>
            <View style={[styles.markerPin, { backgroundColor: color }]}>
                {photoUrl ? (
                    <Image
                        source={{ uri: photoUrl }}
                        style={styles.markerImage}
                        resizeMode="cover"
                    />
                ) : (
                    <Text style={styles.markerIcon}>📦</Text>
                )}
            </View>
            <View style={[styles.markerArrow, { borderTopColor: color }]} />
        </View>
    );
}

export default function AgentMapScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ focusId?: string; lat?: string; lon?: string }>();
    const mapRef = useRef<MapView>(null);

    const [user, setUser] = useState<User | null>(null);
    const [position, setPosition] = useState<Position | null>(null);
    const [items, setItems] = useState<SignalementWithCoords[]>([]);
    const [loading, setLoading] = useState(true);
    const [geocoding, setGeocoding] = useState(false);
    const [error, setError] = useState<string>("");
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [selectedVille, setSelectedVille] = useState<string | null>(null);
    const [villes, setVilles] = useState<string[]>([]);
    const [region, setRegion] = useState<Region | null>(null);
    const [showValidated, setShowValidated] = useState(false);

    async function geocodeAddress(
        adresse: string,
        ville: string,
        codePostal: string
    ): Promise<{ lat: number; lon: number } | null> {
        const cacheKey = `${adresse}|${ville}|${codePostal}`;
        if (cacheKey in geocodeCache) return geocodeCache[cacheKey];

        try {
            const result = await geocode(adresse, ville, codePostal);
            if (result) {
                geocodeCache[cacheKey] = { lat: result.lat, lon: result.lon };
                return { lat: result.lat, lon: result.lon };
            }
        } catch {}

        geocodeCache[cacheKey] = null;
        return null;
    }

    async function load() {
        setError("");
        setLoading(true);

        try {
            const userData = await me();
            setUser(userData);

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
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

            const signalements = await getSignalements();

            // Extraire les villes
            const villesSet = new Set<string>();
            signalements.forEach(s => {
                if (s.ville) villesSet.add(s.ville);
            });
            setVilles(Array.from(villesSet).sort());

            setGeocoding(true);
            const itemsWithCoords: SignalementWithCoords[] = [];

            for (const s of signalements) {
                if (
                    s.lat &&
                    s.lon &&
                    typeof s.lat === "number" &&
                    typeof s.lon === "number" &&
                    !isNaN(s.lat) &&
                    !isNaN(s.lon)
                ) {
                    itemsWithCoords.push({ ...s, latitude: s.lat, longitude: s.lon });
                } else if (s.adresse && s.ville) {
                    const coords = await geocodeAddress(s.adresse, s.ville, s.codePostal || "");
                    if (coords) {
                        itemsWithCoords.push({ ...s, latitude: coords.lat, longitude: coords.lon });
                    }
                }
            }

            setItems(itemsWithCoords);
            setGeocoding(false);

            // Si on a un focusId ou des coordonnées en paramètre, centrer dessus
            if (params.focusId) {
                const focused = itemsWithCoords.find(i => i._id === params.focusId);
                if (focused) {
                    setRegion({
                        latitude: focused.latitude,
                        longitude: focused.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    });
                    return;
                }
            }

            if (params.lat && params.lon) {
                const lat = parseFloat(params.lat);
                const lon = parseFloat(params.lon);
                if (!isNaN(lat) && !isNaN(lon)) {
                    setRegion({
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    });
                    return;
                }
            }

            // Sinon, ajuster la région pour voir tous les markers (sauf validés)
            const visibleItems = itemsWithCoords.filter(i => i.statut !== "valide");
            if (visibleItems.length > 0) {
                const lats = visibleItems.map(i => i.latitude);
                const lons = visibleItems.map(i => i.longitude);
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
    }, [params.focusId, params.lat, params.lon]);

    useFocusEffect(
        useCallback(() => {
            if (!loading) load();
        }, [])
    );

    // Fonction pour vérifier si un signalement collecté doit être masqué (5 min après collecte)
    function shouldHideCollecte(item: SignalementWithCoords): boolean {
        if (item.statut !== "collecte") return false;

        // Chercher le moment où le statut est passé à "collecte"
        const historiqueCollecte = item.historiqueStatuts?.find(h => h.to === "collecte");
        if (!historiqueCollecte?.changedAt) return false;

        const collecteTime = new Date(historiqueCollecte.changedAt).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes en ms

        return (now - collecteTime) > fiveMinutes;
    }

    // Filtrer les items - EXCLURE les validés par défaut ET les collectés > 5 min
    let filteredItems = items;

    // Masquer les collectés après 5 minutes
    filteredItems = filteredItems.filter(s => !shouldHideCollecte(s));

    if (!showValidated) {
        filteredItems = filteredItems.filter(s => s.statut !== "valide");
    }

    if (selectedVille) {
        filteredItems = filteredItems.filter(s => s.ville === selectedVille);
    }
    if (selectedFilter) {
        filteredItems = filteredItems.filter(s => s.statut === selectedFilter);
    }

    // Compter (sans les validés par défaut et sans les collectés > 5 min)
    const visibleItems = items.filter(s => !shouldHideCollecte(s) && s.statut !== "valide");
    const counts = {
        all: visibleItems.length,
        signale: items.filter(s => s.statut === "signale").length,
        valide: items.filter(s => s.statut === "valide").length,
        en_cours: items.filter(s => s.statut === "en_cours").length,
        collecte: items.filter(s => s.statut === "collecte" && !shouldHideCollecte(s)).length,
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

    const initialRegion =
        region ||
        (position
            ? {
                latitude: position.latitude,
                longitude: position.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }
            : {
                latitude: 49.894067,
                longitude: 2.295753,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            });

    const isGestionnaire = user?.role === "gestionnaire";
    const perimetre = user?.perimetreVille;

    return (
        <View style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerCol}>
                    <Text style={styles.title}>
                        {isGestionnaire
                            ? "🗺️ Tous les signalements"
                            : `🗺️ Signalements - ${perimetre || "Mon secteur"}`}
                    </Text>
                    <Text style={styles.subtitle}>
                        {filteredItems.length} signalement{filteredItems.length > 1 ? "s" : ""} à traiter
                        {!isGestionnaire && perimetre && ` à ${perimetre}`}
                    </Text>
                </View>
                <Pressable
                    style={[styles.toggleBtn, showValidated && styles.toggleBtnActive]}
                    onPress={() => setShowValidated(!showValidated)}
                >
                    <Text style={[styles.toggleText, showValidated && styles.toggleTextActive]}>
                        {showValidated ? "✓ Validés" : "Validés"}
                    </Text>
                </Pressable>
            </View>

            {/* Filtre par ville (gestionnaire uniquement) */}
            {isGestionnaire && villes.length > 0 && (
                <View style={styles.villeFilterContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.villeFilters}
                    >
                        <Pressable
                            style={[styles.villeChip, !selectedVille && styles.villeChipActive]}
                            onPress={() => setSelectedVille(null)}
                        >
                            <Text style={[styles.villeChipText, !selectedVille && styles.villeChipTextActive]}>
                                Toutes
                            </Text>
                        </Pressable>
                        {villes.map(v => (
                            <Pressable
                                key={v}
                                style={[styles.villeChip, selectedVille === v && styles.villeChipActive]}
                                onPress={() => setSelectedVille(v)}
                            >
                                <Text style={[styles.villeChipText, selectedVille === v && styles.villeChipTextActive]}>
                                    {v}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Filtres par statut */}
            <View style={styles.filtersContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filters}
                >
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
                        onPress={() => setSelectedFilter("signale")}
                    >
                        <View style={[styles.filterDot, { backgroundColor: COLORS.orange }]} />
                        <Text style={[styles.filterText, selectedFilter === "signale" && styles.filterTextActive]}>
                            Signalés ({counts.signale})
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.filterChip, selectedFilter === "en_cours" && styles.filterChipActive]}
                        onPress={() => setSelectedFilter("en_cours")}
                    >
                        <View style={[styles.filterDot, { backgroundColor: COLORS.purple }]} />
                        <Text style={[styles.filterText, selectedFilter === "en_cours" && styles.filterTextActive]}>
                            En cours ({counts.en_cours})
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.filterChip, selectedFilter === "collecte" && styles.filterChipActive]}
                        onPress={() => setSelectedFilter("collecte")}
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
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton
            >
                {filteredItems.map(s => {
                    const citoyenData = typeof s.citoyen === "object" ? (s.citoyen as CitoyenRef) : null;
                    const isFocused = params.focusId === s._id;
                    const photoUrl = s.photoFilename ? `${BACKEND_URL}/uploads/${s.photoFilename}` : null;

                    return (
                        <Marker
                            key={s._id}
                            coordinate={{ latitude: s.latitude, longitude: s.longitude }}
                            anchor={{ x: 0.5, y: 1 }}
                        >
                            <CustomMarker item={s} isFocused={isFocused} />
                            <Callout
                                onPress={() => router.push(`/gestion?highlight=${s._id}` as Href)}
                                style={styles.calloutWrapper}
                            >
                                <View style={styles.callout}>
                                    {photoUrl && (
                                        <Image
                                            source={{ uri: photoUrl }}
                                            style={styles.calloutImage}
                                            resizeMode="cover"
                                        />
                                    )}
                                    <Text style={styles.calloutTitle}>
                                        {TYPE_ENCOMBRANT_LABELS[
                                                s.typeEncombrant as keyof typeof TYPE_ENCOMBRANT_LABELS
                                                ] ??
                                            s.typeEncombrant ??
                                            "Encombrant"}
                                    </Text>
                                    <View
                                        style={[
                                            styles.calloutBadge,
                                            { backgroundColor: getStatusColor(s.statut) + "20" },
                                        ]}
                                    >
                                        <Text style={[styles.calloutStatus, { color: getStatusColor(s.statut) }]}>
                                            {STATUT_LABELS[s.statut as keyof typeof STATUT_LABELS] ??
                                                s.statut ??
                                                "Signalé"}
                                        </Text>
                                    </View>
                                    {!!s.description && (
                                        <Text style={styles.calloutDesc} numberOfLines={2}>
                                            {s.description}
                                        </Text>
                                    )}
                                    <Text style={styles.calloutAddr}>
                                        📍 {s.adresse ?? ""}
                                        {s.ville ? `, ${s.ville}` : ""}
                                    </Text>
                                    {citoyenData && (
                                        <Text style={styles.calloutCitoyen}>
                                            👤 {citoyenData.name || "Citoyen"}
                                        </Text>
                                    )}
                                    <Text style={styles.calloutHint}>Appuyer pour gérer →</Text>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Légende */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.orange }]} />
                    <Text style={styles.legendText}>Signalé</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.purple }]} />
                    <Text style={styles.legendText}>En cours</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.blue }]} />
                    <Text style={styles.legendText}>Collecté</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.danger }]} />
                    <Text style={styles.legendText}>Refusé</Text>
                </View>
                {showValidated && (
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: COLORS.green }]} />
                        <Text style={styles.legendText}>Validé</Text>
                    </View>
                )}
            </View>
        </View>
    );
}