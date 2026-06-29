// app/(tabs-agent)/gestion.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useRouter, type Href } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { me } from "../../src/api/client";
import {
    assignEquipeToSignalement,
    getChefAgentsByVille,
    getGestionSignalements,
    updateSignalementStatut,
    type ChefAgentInfo,
    type GestionSignalement,
} from "../../src/api/gestionClient";
import { BACKEND_URL } from "../../src/config";
import { COLORS, getStatusBgColor, getStatusColor } from "../../src/styles";
import { gestionStyles as styles } from "../../src/styles/gestionStyles";
import {
    STATUT_LABELS,
    TYPE_ENCOMBRANT_LABELS,
    type CitoyenRef,
} from "../../src/types/signalement";
import type { User } from "../../src/types/user";

const STATUTS = [
  "signale",
  "valide",
  "en_cours",
  "collecte",
  "refuse",
] as const;

function getCitoyenData(
  citoyen: string | CitoyenRef | undefined,
): CitoyenRef | null {
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
  const [selectedItem, setSelectedItem] = useState<GestionSignalement | null>(
    null,
  );
  const [updating, setUpdating] = useState(false);

  // Pour la sélection du chef d'agent (équipe) lors de la validation
  const [equipeModalVisible, setEquipeModalVisible] = useState(false);
  const [chefAgents, setChefAgents] = useState<ChefAgentInfo[]>([]);
  const [selectedChefAgentId, setSelectedChefAgentId] = useState<string | null>(
    null,
  );
  const [loadingChefs, setLoadingChefs] = useState(false);

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
    }, []),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleChangeStatus(
    newStatut: string,
    chefAgentId?: string | null,
  ) {
    if (!selectedItem) return;

    setUpdating(true);
    try {
      await updateSignalementStatut(
        selectedItem._id,
        newStatut,
        chefAgentId || undefined,
      );

      // Trouver le nom du chef d'agent pour l'affichage
      const chefAgent = chefAgents.find((c) => c._id === chefAgentId);

      setItems((prev) =>
        prev.map((i) =>
          i._id === selectedItem._id
            ? {
                ...i,
                statut: newStatut,
                chefAgentAssigne: chefAgentId
                  ? {
                      _id: chefAgentId,
                      name: chefAgent?.name || "Chef d'équipe",
                    }
                  : i.chefAgentAssigne,
              }
            : i,
        ),
      );
      setModalVisible(false);
      setEquipeModalVisible(false);
      setSelectedChefAgentId(null);
    } catch (e: unknown) {
      const err = e as Error;
      Alert.alert("Erreur", err?.message || "Erreur");
    } finally {
      setUpdating(false);
    }
  }

  // Ouvrir la modal pour assigner une équipe (indépendamment du statut)
  async function openAssignEquipeModal(item: GestionSignalement) {
    setSelectedItem(item);
    setLoadingChefs(true);
    setEquipeModalVisible(true);

    try {
      const ville = item.ville || "";
      const chefs = await getChefAgentsByVille(ville);
      setChefAgents(chefs);

      // Pré-sélectionner l'équipe actuelle si elle existe
      if (item.chefAgentAssigne) {
        const currentChefId =
          typeof item.chefAgentAssigne === "object"
            ? item.chefAgentAssigne._id
            : item.chefAgentAssigne;
        setSelectedChefAgentId(currentChefId);
      }
    } catch (e) {
      console.error("Erreur chargement chefs d'agents:", e);
      setChefAgents([]);
    } finally {
      setLoadingChefs(false);
    }
  }

  // Assigner une équipe sans changer le statut
  async function handleAssignEquipe() {
    if (!selectedItem || !selectedChefAgentId) {
      Alert.alert("Erreur", "Veuillez sélectionner une équipe.");
      return;
    }

    setUpdating(true);
    try {
      await assignEquipeToSignalement(selectedItem._id, selectedChefAgentId);

      const chefAgent = chefAgents.find((c) => c._id === selectedChefAgentId);

      setItems((prev) =>
        prev.map((i) =>
          i._id === selectedItem._id
            ? {
                ...i,
                chefAgentAssigne: {
                  _id: selectedChefAgentId,
                  name: chefAgent?.name || "Chef d'équipe",
                },
              }
            : i,
        ),
      );

      setEquipeModalVisible(false);
      setSelectedChefAgentId(null);
      setChefAgents([]);

      Alert.alert(
        "Succès ✅",
        `Signalement assigné à l'équipe de ${chefAgent?.name || "Chef d'équipe"}.`,
      );
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
        >
          <Pressable
            style={[styles.chip, !selectedStatut && styles.chipActive]}
            onPress={() => setSelectedStatut(null)}
          >
            <Text
              style={[
                styles.chipText,
                !selectedStatut && styles.chipTextActive,
              ]}
            >
              Tous
            </Text>
          </Pressable>
          {STATUTS.map((s) => (
            <Pressable
              key={s}
              style={[styles.chip, selectedStatut === s && styles.chipActive]}
              onPress={() => setSelectedStatut(s)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedStatut === s && styles.chipTextActive,
                ]}
              >
                {STATUT_LABELS[s]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {isGestionnaire && villes.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              style={[
                styles.chipSmall,
                !selectedVille && styles.chipSmallActive,
              ]}
              onPress={() => setSelectedVille(null)}
            >
              <Text
                style={[
                  styles.chipSmallText,
                  !selectedVille && styles.chipSmallTextActive,
                ]}
              >
                Toutes villes
              </Text>
            </Pressable>
            {villes.map((v) => (
              <Pressable
                key={v}
                style={[
                  styles.chipSmall,
                  selectedVille === v && styles.chipSmallActive,
                ]}
                onPress={() => setSelectedVille(v)}
              >
                <Text
                  style={[
                    styles.chipSmallText,
                    selectedVille === v && styles.chipSmallTextActive,
                  ]}
                >
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
          items.map((item) => {
            const typeLabel =
              TYPE_ENCOMBRANT_LABELS[
                item.typeEncombrant as keyof typeof TYPE_ENCOMBRANT_LABELS
              ] ||
              item.typeEncombrant ||
              "Encombrant";
            const citoyenData = getCitoyenData(item.citoyen);
            const citoyenId = getCitoyenId(item.citoyen);

            // Utiliser photoBase64 si disponible, sinon photoFilename
            const photoSource = item.photoBase64
              ? { uri: item.photoBase64 }
              : item.photoFilename
                ? { uri: `${BACKEND_URL}/uploads/${item.photoFilename}` }
                : null;

            const mapUrl =
              item.lat && item.lon
                ? `/map?focusId=${item._id}&lat=${item.lat}&lon=${item.lon}`
                : `/map?focusId=${item._id}`;

            return (
              <View key={item._id} style={styles.card}>
                {/* Image */}
                {photoSource && (
                  <Image
                    source={photoSource}
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
                        ? new Date(item.dateSignalement).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )
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
                <Pressable
                  onPress={() => router.push(mapUrl as Href)}
                  style={styles.addrRow}
                >
                  <Text style={styles.cardAddr}>
                    📍 {item.adresse}, {item.ville}
                  </Text>
                  <Text style={styles.mapLink}>Voir sur la carte →</Text>
                </Pressable>

                {/* Citoyen */}
                {citoyenData && (
                  <Pressable
                    style={styles.citoyenRow}
                    onPress={() =>
                      citoyenId && router.push(`/citoyen/${citoyenId}` as Href)
                    }
                  >
                    <Text style={styles.citoyenName}>
                      👤 {citoyenData.name || "Citoyen"}
                    </Text>
                    <Text style={styles.citoyenPoints}>
                      {citoyenData.pointsTotal || 0} pts
                    </Text>
                  </Pressable>
                )}

                {/* Points */}
                {(item.pointsAttribues || 0) > 0 && (
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>
                      +{item.pointsAttribues} pts
                    </Text>
                  </View>
                )}

                {/* Équipe assignée (chef d'agent) */}
                {item.chefAgentAssigne && (
                  <Pressable
                    style={styles.equipeBadge}
                    onPress={() => openAssignEquipeModal(item)}
                  >
                    <Text style={styles.equipeText}>
                      👥 Équipe de{" "}
                      {typeof item.chefAgentAssigne === "object"
                        ? item.chefAgentAssigne.name
                        : "Chef d'équipe"}{" "}
                      ✏️
                    </Text>
                  </Pressable>
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

                  {/* Bouton Assigner équipe */}
                  <Pressable
                    style={styles.equipeBtn}
                    onPress={() => openAssignEquipeModal(item)}
                  >
                    <Text style={styles.equipeBtnText}>👥</Text>
                  </Pressable>

                  <Pressable
                    style={styles.mapBtn}
                    onPress={() => router.push(mapUrl as Href)}
                  >
                    <Text style={styles.mapBtnText}>🗺️</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal changement de statut */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Changer le statut</Text>
            <Text style={styles.modalSubtitle}>
              {selectedItem?.typeEncombrant} - {selectedItem?.ville}
            </Text>

            {STATUTS.map((s) => {
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

            <Pressable
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal sélection du chef d'agent (équipe) */}
      <Modal
        visible={equipeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEquipeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👥 Assigner une équipe</Text>
            <Text style={styles.modalSubtitle}>
              Quelle équipe de {selectedItem?.ville || "cette zone"} prend en
              charge ce signalement ?
            </Text>

            {loadingChefs ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="large" color={COLORS.blue} />
                <Text style={{ marginTop: 10, color: COLORS.muted }}>
                  Chargement des équipes...
                </Text>
              </View>
            ) : chefAgents.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: COLORS.muted, textAlign: "center" }}>
                  Aucun chef d'équipe trouvé pour cette zone.{"\n"}
                  Veuillez d'abord créer un chef d'agent pour{" "}
                  {selectedItem?.ville || "cette ville"}.
                </Text>
              </View>
            ) : (
              chefAgents.map((chef) => {
                const isSelected = selectedChefAgentId === chef._id;
                return (
                  <Pressable
                    key={chef._id}
                    style={[
                      styles.equipeOption,
                      isSelected && styles.equipeOptionSelected,
                    ]}
                    onPress={() => setSelectedChefAgentId(chef._id)}
                  >
                    <View
                      style={[
                        styles.equipeRadio,
                        isSelected && styles.equipeRadioSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.equipeRadioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.equipeOptionText,
                          isSelected && styles.equipeOptionTextSelected,
                        ]}
                      >
                        Équipe de {chef.name}
                      </Text>
                      <Text style={{ color: COLORS.muted, fontSize: 12 }}>
                        {chef.email}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}

            {updating && <ActivityIndicator style={{ marginTop: 10 }} />}

            {chefAgents.length > 0 && (
              <Pressable
                style={[
                  styles.validateBtn,
                  !selectedChefAgentId && { opacity: 0.5 },
                ]}
                onPress={handleAssignEquipe}
                disabled={!selectedChefAgentId || updating}
              >
                <Text style={styles.validateBtnText}>
                  Assigner cette équipe
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.modalCancel}
              onPress={() => {
                setEquipeModalVisible(false);
                setSelectedChefAgentId(null);
                setChefAgents([]);
              }}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
