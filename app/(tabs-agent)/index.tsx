// app/(tabs-agent)/index.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useRouter, type Href } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { logout, me } from "../../src/api/client";
import {
    getDashboardStats,
    type DashboardStats,
} from "../../src/api/gestionClient";
import { COLORS } from "../../src/styles";
import { dashboardAgentStyles as styles } from "../../src/styles/dashboardAgentStyles";
import { TYPE_ENCOMBRANT_LABELS } from "../../src/types/signalement";
import type { User } from "../../src/types/user";

function KPICard({
  label,
  value,
  color = COLORS.blue,
  icon,
}: {
  label: string;
  value: number | string;
  color?: string;
  icon?: string;
}) {
  return (
    <View style={styles.kpiCard}>
      {icon && <Text style={styles.kpiIcon}>{icon}</Text>}
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <View style={styles.progressBg}>
      <View
        style={[
          styles.progressFill,
          { width: `${percent}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export default function AgentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedVille, setSelectedVille] = useState<string | null>(null);

  async function load(ville?: string | null) {
    setError("");
    try {
      const [userData, statsData] = await Promise.all([
        me(),
        getDashboardStats(ville || undefined),
      ]);
      setUser(userData);
      setStats(statsData);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(selectedVille);
    }, [selectedVille]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load(selectedVille);
    setRefreshing(false);
  }

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login" as Href);
  }

  if (loading) {
    return (
      <View style={[styles.page, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  const kpi = stats?.kpi;
  const isGestionnaire = user?.role === "gestionnaire";

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Bonjour {user?.name} 👋</Text>
          <Text style={styles.role}>
            {user?.role === "gestionnaire"
              ? "Gestionnaire"
              : user?.role === "chef_agent"
                ? "Chef d'agent"
                : "Agent"}
            {user?.perimetreVille ? ` • ${user.perimetreVille}` : ""}
          </Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </Pressable>
      </View>

      {/* Erreur */}
      {!!error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => load(selectedVille)}
            style={styles.retryBtn}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      )}

      {/* Filtre par ville (gestionnaire) */}
      {isGestionnaire && stats?.allowPerimetreFilter && (
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Filtrer par ville</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              style={[
                styles.filterChip,
                !selectedVille && styles.filterChipActive,
              ]}
              onPress={() => {
                setSelectedVille(null);
                load(null);
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !selectedVille && styles.filterChipTextActive,
                ]}
              >
                Toutes
              </Text>
            </Pressable>
            {stats.perimetres.map((v) => (
              <Pressable
                key={v}
                style={[
                  styles.filterChip,
                  selectedVille === v && styles.filterChipActive,
                ]}
                onPress={() => {
                  setSelectedVille(v);
                  load(v);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedVille === v && styles.filterChipTextActive,
                  ]}
                >
                  {v}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* KPIs */}
      <View style={styles.kpiGrid}>
        <KPICard
          label="Signalements"
          value={kpi?.totalSignalements ?? 0}
          icon="📋"
        />
        <KPICard
          label="Validés"
          value={kpi?.totalValides ?? 0}
          color={COLORS.green}
          icon="✅"
        />
        <KPICard
          label="En cours"
          value={kpi?.totalEnCours ?? 0}
          color={COLORS.orange}
          icon="🔄"
        />
        <KPICard
          label="Collectés"
          value={kpi?.totalCollectes ?? 0}
          color={COLORS.blue}
          icon="🚛"
        />
      </View>

      {/* Signalements urgents (> 7 jours) */}
      {(stats?.kpi?.signalementsUrgents ?? 0) > 0 && (
        <Pressable
          style={styles.urgentCard}
          onPress={() => router.push("/gestion?statut=signale" as Href)}
        >
          <View style={styles.urgentIcon}>
            <Text style={styles.urgentIconText}>🔥</Text>
          </View>
          <View style={styles.urgentInfo}>
            <Text style={styles.urgentTitle}>Signalements urgents</Text>
            <Text style={styles.urgentSubtitle}>
              En attente depuis plus de 7 jours
            </Text>
          </View>
          <View style={styles.urgentCount}>
            <Text style={styles.urgentCountText}>
              {stats?.kpi?.signalementsUrgents}
            </Text>
          </View>
        </Pressable>
      )}

      {/* Taux de validation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Taux de validation</Text>
        <View style={styles.tauxRow}>
          <Text style={styles.tauxValue}>{kpi?.tauxValidation ?? 0}%</Text>
          <ProgressBar
            value={kpi?.tauxValidation ?? 0}
            max={100}
            color={COLORS.green}
          />
        </View>
        <Text style={styles.tauxHint}>
          {kpi?.totalValides ?? 0} validés sur {kpi?.totalSignalements ?? 0}{" "}
          signalements
        </Text>
      </View>

      {/* Actions rapides */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: COLORS.blue }]}
          onPress={() => router.push("/gestion" as Href)}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Gérer les signalements</Text>
        </Pressable>
        {isGestionnaire && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: COLORS.purple }]}
            onPress={() => router.push("/users" as Href)}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Utilisateurs</Text>
          </Pressable>
        )}
      </View>

      {/* Répartition par type */}
      {stats?.repartitionTypes && stats.repartitionTypes.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Répartition par type</Text>
          {stats.repartitionTypes.slice(0, 5).map((r) => {
            const maxVal = stats.repartitionTypes[0]?.total || 1;
            const label =
              TYPE_ENCOMBRANT_LABELS[
                r.type as keyof typeof TYPE_ENCOMBRANT_LABELS
              ] || r.type;
            return (
              <View key={r.type} style={styles.typeRow}>
                <Text style={styles.typeLabel}>{label}</Text>
                <View style={styles.typeBarWrap}>
                  <ProgressBar
                    value={r.total}
                    max={maxVal}
                    color={COLORS.blue}
                  />
                </View>
                <Text style={styles.typeValue}>{r.total}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Signalements en attente par ville */}
      {isGestionnaire &&
        stats?.signalementsParVille &&
        stats.signalementsParVille.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📍 En attente par ville</Text>
            {stats.signalementsParVille.slice(0, 5).map((v) => {
              const maxVal = stats.signalementsParVille[0]?.enAttente || 1;
              return (
                <View key={v.ville} style={styles.typeRow}>
                  <Text style={styles.typeLabel}>{v.ville}</Text>
                  <View style={styles.typeBarWrap}>
                    <ProgressBar
                      value={v.enAttente}
                      max={maxVal}
                      color={COLORS.orange}
                    />
                  </View>
                  <Text style={styles.typeValue}>{v.enAttente}</Text>
                </View>
              );
            })}
          </View>
        )}

      {/* Activité des agents - avec noms et emails */}
      {stats?.volumeParAgent && stats.volumeParAgent.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Activité des agents</Text>
          {stats.volumeParAgent.slice(0, 5).map((a, index) => (
            <View key={a.agentId} style={styles.agentRow}>
              <View style={styles.agentRank}>
                <Text style={styles.agentRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>
                  {a.name || "Agent inconnu"}
                </Text>
                <Text style={styles.agentEmail}>{a.email || "—"}</Text>
                <Text style={styles.agentRole}>
                  {a.role === "chef_agent"
                    ? "Chef d'équipe"
                    : a.role === "gestionnaire"
                      ? "Gestionnaire"
                      : "Agent"}
                  {a.perimetreVille ? ` • ${a.perimetreVille}` : ""}
                </Text>
              </View>
              <View style={styles.agentStats}>
                <Text style={styles.agentCount}>{a.totalValides}</Text>
                <Text style={styles.agentCountLabel}>validés</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
