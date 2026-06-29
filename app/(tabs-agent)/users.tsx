// app/(tabs-agent)/users.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    getUsers,
    getUsersStats,
    toggleUserActive,
    type UsersStats,
} from "../../src/api/gestionClient";
import { COLORS, getRoleColor } from "../../src/styles";
import { usersStyles as styles } from "../../src/styles/usersStyles";
import type { User } from "../../src/types/user";
import { ROLE_LABELS } from "../../src/types/user";

const ROLES = ["citoyen", "agent", "chef_agent", "gestionnaire"] as const;

function RoleBadge({ role }: { role: string }) {
  const color = getRoleColor(role);
  return (
    <View style={[styles.roleBadge, { backgroundColor: `${color}20` }]}>
      <Text style={[styles.roleBadgeText, { color }]}>
        {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
      </Text>
    </View>
  );
}

export default function UsersScreen() {
  const router = useRouter();
  const [items, setItems] = useState<User[]>([]);
  const [stats, setStats] = useState<UsersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  async function load() {
    try {
      const [data, statsData] = await Promise.all([
        getUsers({
          role: selectedRole || undefined,
          search: search || undefined,
        }),
        getUsersStats(),
      ]);
      setItems(data.items);
      setStats(statsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [selectedRole]);

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

  async function handleToggleActive(user: User) {
    Alert.alert(
      user.isActive !== false ? "Désactiver" : "Activer",
      `${user.name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              const r = await toggleUserActive(user._id);
              setItems((prev) =>
                prev.map((u) =>
                  u._id === user._id ? { ...u, isActive: r.isActive } : u,
                ),
              );
            } catch (e: any) {
              Alert.alert("Erreur", e?.message);
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={[styles.page, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Stats */}
      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalCitoyens}</Text>
            <Text style={styles.statLabel}>Citoyens</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.blue }]}>
              {stats.totalAgents}
            </Text>
            <Text style={styles.statLabel}>Agents</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.orange }]}>
              {stats.totalChefAgents}
            </Text>
            <Text style={styles.statLabel}>Chefs</Text>
          </View>
        </View>
      )}

      {/* Bouton Créer un utilisateur */}
      <Pressable
        style={{
          backgroundColor: COLORS.green,
          paddingVertical: 14,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          gap: 8,
        }}
        onPress={() => router.push("/(tabs-agent)/user-create")}
      >
        <Text style={{ fontSize: 18 }}>➕</Text>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
          Créer un utilisateur
        </Text>
      </Pressable>

      {/* Recherche */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => {
            setLoading(true);
            load();
          }}
        />
        <Pressable
          style={styles.searchBtn}
          onPress={() => {
            setLoading(true);
            load();
          }}
        >
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </Pressable>
      </View>

      {/* Filtres par rôle */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      >
        <Pressable
          style={[styles.chip, !selectedRole && styles.chipActive]}
          onPress={() => setSelectedRole(null)}
        >
          <Text
            style={[styles.chipText, !selectedRole && styles.chipTextActive]}
          >
            Tous
          </Text>
        </Pressable>
        {ROLES.map((r) => (
          <Pressable
            key={r}
            style={[styles.chip, selectedRole === r && styles.chipActive]}
            onPress={() => setSelectedRole(r)}
          >
            <Text
              style={[
                styles.chipText,
                selectedRole === r && styles.chipTextActive,
              ]}
            >
              {ROLE_LABELS[r]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={styles.countText}>
        {items.length} utilisateur{items.length > 1 ? "s" : ""}
      </Text>

      {/* Liste des utilisateurs */}
      {items.map((user) => (
        <View key={user._id} style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>
                {user.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <RoleBadge role={user.role} />
          </View>

          {/* Meta */}
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>
              📍 {user.ville || user.perimetreVille || "—"}
            </Text>
            {user.role === "citoyen" && (
              <Text style={{ color: COLORS.green, fontWeight: "800" }}>
                {user.pointsTotal || 0} pts
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.cardActions}>
            <Pressable
              style={[
                styles.actionBtn,
                {
                  backgroundColor:
                    user.isActive !== false
                      ? "rgba(176,0,32,0.1)"
                      : "rgba(112,190,85,0.1)",
                },
              ]}
              onPress={() => handleToggleActive(user)}
            >
              <Text
                style={{
                  color: user.isActive !== false ? COLORS.danger : COLORS.green,
                  fontWeight: "700",
                }}
              >
                {user.isActive !== false ? "Désactiver" : "Activer"}
              </Text>
            </Pressable>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    user.isActive !== false ? COLORS.green : COLORS.danger,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
