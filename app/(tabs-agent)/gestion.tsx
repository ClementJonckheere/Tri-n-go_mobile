// app/(tabs-agent)/gestion.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Modal,
    Image,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { me } from "../../src/api/client";
import { getGestionSignalements, updateSignalementStatut, type GestionSignalement } from "../../src/api/gestionClient";
import type { User } from "../../src/types/user";
import { TYPE_ENCOMBRANT_LABELS, STATUT_LABELS, type CitoyenRef } from "../../src/types/signalement";
import { BACKEND_URL } from "../../src/config";
import { COLORS, getStatusColor, getStatusBgColor } from "../../src/styles";
import { gestionStyles as styles } from "../../src/styles/gestionStyles";

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
    const bg = getStatusBgColor(s);
    const color = getStatusColor(s);
    const label = STATUT_LABELS[s as keyof typeof STATUT_LABELS] || s;

    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
    );
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
            const [userData, data] = await Promise.all([
                me(),
                getGestionSignalements({
                    ville: selectedVille || undefined,
                    statut: selectedStatut || undefined,
                }),
            ]);
            setUser(userData);
            setItems(data.items);
            setVilles(data.villes);
        } catch (e: unknown) {
            const err = e as Error;
            setError(err?.message || "Erreur");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [selectedVille, selectedStatut]);

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

    async function handleChangeStatus(newStatut: string) {
        if (!selectedItem) return;
        setUpdating(true);
        try {
            await updateSignalementStatut(selectedItem._id, newStatut);
            setItems(prev =>
                prev.map(i => (i._id === selectedItem._id ? { ...i, statut: newStatut } : i))
            );
            setModalVisible(false);
            if (newStatut === "valide") {
                Alert.alert("Validé ✅", "Signalement validé avec succès.");
            }
        } catch (e: unknown) {
            const err = e as Error;
            Alert.alert("Erreur", err?.message || "Erreur");
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return (
            <View style={[styles.page, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.blue} />
            </View>
        );
    }

    const isGestionnaire = user?.role === "gestionnaire";

    return (
        <View style={styles.page}>
            {/* Filtres */}
            <View style={styles.filtersCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                    <Pressable
                        style={[styles.chip, !selectedStatut && styles.chipActive]}
                        onPress={() => setSelectedStatut(null)}
                    >
                        <Text style={[styles.chipText, !selectedStatut && styles.chipTextActive]}>Tous</Text>
                    </Pressable>
                    {STATUTS.map(s => (
                        <Pressable
                            key={s}
                            style={[styles.chip, selectedStatut === s && styles.chipActive]}
                            onPress={() => setSelectedStatut(s)}
                        >
                            <Text style={[styles.chipText, selectedStatut === s && styles.chipTextActive]}>
                                {STATUT_LABELS[s]}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {isGestionnaire && villes.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <Pressable
                            style={[styles.chipSmall, !selectedVille && styles.chipSmallActive]}
                            onPress={() => setSelectedVille(null)}
                        >
                            <Text style={[styles.chipSmallText, !selectedVille && styles.chipSmallTextActive]}>
                                Toutes villes
                            </Text>
                        </Pressable>
                        {villes.map(v => (
                            <Pressable
                                key={v}
                                style={[styles.chipSmall, selectedVille === v && styles.chipSmallActive]}
                                onPress={() => setSelectedVille(v)}
                            >
                                <Text style={[styles.chipSmallText, selectedVille === v && styles.chipSmallTextActive]}>
                                    {v}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Liste */}
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {!!error && (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <Text style={styles.countText}>
                    {items.length} signalement{items.length > 1 ? "s" : ""}
                </Text>

                {items.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Aucun signalement</Text>
                    </View>
                ) : (
                    items.map(item => {
                        const typeLabel =
                            TYPE_ENCOMBRANT_LABELS[item.typeEncombrant as keyof typeof TYPE_ENCOMBRANT_LABELS] ||
                            item.typeEncombrant ||
                            "Encombrant";
                        const citoyenData = getCitoyenData(item.citoyen);
                        const citoyenId = getCitoyenId(item.citoyen);
                        const photoUrl = item.photoFilename ? `${BACKEND_URL}/uploads/${item.photoFilename}` : null;
                        const mapUrl =
                            item.lat && item.lon
                                ? `/map?focusId=${item._id}&lat=${item.lat}&lon=${item.lon}`
                                : `/map?focusId=${item._id}`;

                        return (
                            <View key={item._id} style={styles.card}>
                                {/* Image */}
                                {photoUrl && (
                                    <Image
                                        source={{ uri: photoUrl }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                )}

                                {/* Header */}
                                <View style={styles.cardHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardType}>{typeLabel}</Text>
                                        <Text style={styles.cardDate}>
                                            {item.dateSignalement
                                                ? new Date(item.dateSignalement).toLocaleDateString("fr-FR", {
                                                    day: "numeric",
                                                    month: "short",
                                                })
                                                : "—"}
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={() => {
                                            setSelectedItem(item);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <StatusBadge status={item.statut || "signale"} />
                                    </Pressable>
                                </View>

                                {/* Description */}
                                {!!item.description && (
                                    <Text style={styles.cardDesc} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}

                                {/* Adresse */}
                                <Pressable onPress={() => router.push(mapUrl as Href)} style={styles.addrRow}>
                                    <Text style={styles.cardAddr}>📍 {item.adresse}, {item.ville}</Text>
                                    <Text style={styles.mapLink}>Voir sur la carte →</Text>
                                </Pressable>

                                {/* Citoyen */}
                                {citoyenData && (
                                    <Pressable
                                        style={styles.citoyenRow}
                                        onPress={() => citoyenId && router.push(`/citoyen/${citoyenId}` as Href)}
                                    >
                                        <Text style={styles.citoyenName}>👤 {citoyenData.name || "Citoyen"}</Text>
                                        <Text style={styles.citoyenPoints}>{citoyenData.pointsTotal || 0} pts</Text>
                                    </Pressable>
                                )}

                                {/* Points */}
                                {(item.pointsAttribues || 0) > 0 && (
                                    <View style={styles.pointsBadge}>
                                        <Text style={styles.pointsText}>+{item.pointsAttribues} pts</Text>
                                    </View>
                                )}

                                {/* Actions */}
                                <View style={styles.actionsRow}>
                                    <Pressable
                                        style={styles.actionBtn}
                                        onPress={() => {
                                            setSelectedItem(item);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <Text style={styles.actionBtnText}>Changer statut</Text>
                                    </Pressable>
                                    <Pressable style={styles.mapBtn} onPress={() => router.push(mapUrl as Href)}>
                                        <Text style={styles.mapBtnText}>🗺️</Text>
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Modal changement de statut */}
            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Changer le statut</Text>
                        <Text style={styles.modalSubtitle}>
                            {selectedItem?.typeEncombrant} - {selectedItem?.ville}
                        </Text>

                        {STATUTS.map(s => {
                            const isCurrent = selectedItem?.statut === s;
                            return (
                                <Pressable
                                    key={s}
                                    style={[styles.statusOption, isCurrent && { opacity: 0.5 }]}
                                    onPress={() => !isCurrent && handleChangeStatus(s)}
                                    disabled={updating || isCurrent}
                                >
                                    <StatusBadge status={s} />
                                    {isCurrent && <Text style={styles.currentLabel}>Actuel</Text>}
                                </Pressable>
                            );
                        })}

                        {updating && <ActivityIndicator style={{ marginTop: 10 }} />}

                        <Pressable style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCancelText}>Annuler</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}