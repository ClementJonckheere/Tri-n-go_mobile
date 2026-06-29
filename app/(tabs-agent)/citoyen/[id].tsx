// app/(tabs-agent)/citoyen/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getCitoyenFiche,
  type CitoyenFiche,
} from "../../../src/api/gestionClient";
import { COLORS, getStatusBgColor, getStatusColor } from "../../../src/styles";
import {
  STATUT_LABELS,
  TYPE_ENCOMBRANT_LABELS,
} from "../../../src/types/signalement";

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

export default function CitoyenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<CitoyenFiche | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const fiche = await getCitoyenFiche(id!);
      setData(fiche);
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Citoyen non trouvé"}</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </Pressable>
      </View>
    );
  }

  const { citoyen, signalements, stats, totalPoints } = data;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </Pressable>
      </View>

      {/* Profil citoyen */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {citoyen.name?.charAt(0).toUpperCase() || "C"}
          </Text>
        </View>
        <Text style={styles.name}>{citoyen.name || "Citoyen"}</Text>
        <Text style={styles.email}>{citoyen.email}</Text>
        {citoyen.ville && <Text style={styles.ville}>📍 {citoyen.ville}</Text>}
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsValue}>{totalPoints}</Text>
          <Text style={styles.pointsLabel}>points</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: COLORS.green }]}>
            {stats.valide + stats.collecte}
          </Text>
          <Text style={styles.statLabel}>Validés</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: COLORS.orange }]}>
            {stats.signale}
          </Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: COLORS.danger }]}>
            {stats.refuse}
          </Text>
          <Text style={styles.statLabel}>Refusés</Text>
        </View>
      </View>

      {/* Liste des signalements */}
      <Text style={styles.sectionTitle}>
        Signalements ({signalements.length})
      </Text>

      {signalements.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Aucun signalement</Text>
        </View>
      ) : (
        signalements.map((item) => {
          const typeLabel =
            TYPE_ENCOMBRANT_LABELS[
              item.typeEncombrant as keyof typeof TYPE_ENCOMBRANT_LABELS
            ] ||
            item.typeEncombrant ||
            "Encombrant";

          const photoSource = item.photoBase64
            ? { uri: item.photoBase64 }
            : null;

          return (
            <View key={item._id} style={styles.card}>
              {photoSource && (
                <Image
                  source={photoSource}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardType}>{typeLabel}</Text>
                  <StatusBadge status={item.statut} />
                </View>
                <Text style={styles.cardDate}>
                  {item.dateSignalement
                    ? new Date(item.dateSignalement).toLocaleDateString("fr-FR")
                    : "—"}
                </Text>
                <Text style={styles.cardAddr}>
                  📍 {item.adresse}, {item.ville}
                </Text>
                {(item.pointsAttribues || 0) > 0 && (
                  <Text style={styles.cardPoints}>
                    +{item.pointsAttribues} pts
                  </Text>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  header: {
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 8,
  },
  backBtnText: {
    color: COLORS.blue,
    fontWeight: "700",
    fontSize: 15,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
  },
  email: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  ville: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  pointsBadge: {
    marginTop: 16,
    backgroundColor: `${COLORS.green}15`,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.green,
  },
  pointsLabel: {
    fontSize: 14,
    color: COLORS.green,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardType: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  cardAddr: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
  },
  cardPoints: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.green,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
