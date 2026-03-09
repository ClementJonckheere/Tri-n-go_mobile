// app/(tabs-agent)/index.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { me, logout } from "../../src/api/client";
import { getDashboardStats, type DashboardStats } from "../../src/api/gestionClient";
import type { User } from "../../src/types/user";
import { TYPE_ENCOMBRANT_LABELS } from "../../src/types/signalement";
import { COLORS } from "../../src/styles";
import { dashboardAgentStyles as styles } from "../../src/styles/dashboardAgentStyles";

function KPICard({ label, value, color = COLORS.blue, icon }: { label: string; value: number | string; color?: string; icon?: string }) {
    return (
        <View style={styles.kpiCard}>
            {icon && <Text style={styles.kpiIcon}>{icon}</Text>}
            <Text style={[styles.kpiValue, { color }]}>{value}</Text>
            <Text style={styles.kpiLabel}>{label}</Text>
        </View>
    );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
    const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
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
        }, [selectedVille])
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                    <Pressable onPress={() => load(selectedVille)} style={styles.retryBtn}>
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
                            style={[styles.filterChip, !selectedVille && styles.filterChipActive]}
                            onPress={() => {
                                setSelectedVille(null);
                                load(null);
                            }}
                        >
                            <Text style={[styles.filterChipText, !selectedVille && styles.filterChipTextActive]}>
                                Toutes
                            </Text>
                        </Pressable>
                        {stats.perimetres.map(v => (
                            <Pressable
                                key={v}
                                style={[styles.filterChip, selectedVille === v && styles.filterChipActive]}
                                onPress={() => {
                                    setSelectedVille(v);
                                    load(v);
                                }}
                            >
                                <Text style={[styles.filterChipText, selectedVille === v && styles.filterChipTextActive]}>
                                    {v}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* KPIs */}
            <View style={styles.kpiGrid}>
                <KPICard label="Signalements" value={kpi?.totalSignalements ?? 0} icon="📋" />
                <KPICard label="Validés" value={kpi?.totalValides ?? 0} color={COLORS.green} icon="✅" />
                <KPICard label="En cours" value={kpi?.totalEnCours ?? 0} color={COLORS.orange} icon="🔄" />
                <KPICard label="Collectés" value={kpi?.totalCollectes ?? 0} color={COLORS.blue} icon="🚛" />
            </View>

            {/* Taux de validation */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Taux de validation</Text>
                <View style={styles.tauxRow}>
                    <Text style={styles.tauxValue}>{kpi?.tauxValidation ?? 0}%</Text>
                    <ProgressBar value={kpi?.tauxValidation ?? 0} max={100} color={COLORS.green} />
                </View>
                <Text style={styles.tauxHint}>
                    {kpi?.totalValides ?? 0} validés sur {kpi?.totalSignalements ?? 0} signalements
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
                    {stats.repartitionTypes.slice(0, 5).map(r => {
                        const maxVal = stats.repartitionTypes[0]?.total || 1;
                        const label = TYPE_ENCOMBRANT_LABELS[r.type as keyof typeof TYPE_ENCOMBRANT_LABELS] || r.type;
                        return (
                            <View key={r.type} style={styles.typeRow}>
                                <Text style={styles.typeLabel}>{label}</Text>
                                <View style={styles.typeBarWrap}>
                                    <ProgressBar value={r.total} max={maxVal} color={COLORS.blue} />
                                </View>
                                <Text style={styles.typeValue}>{r.total}</Text>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Top citoyens */}
            {stats?.classementCitoyens && stats.classementCitoyens.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏆 Top citoyens</Text>
                    {stats.classementCitoyens.slice(0, 5).map(c => (
                        <Pressable
                            key={c.citoyenId}
                            style={styles.rankRow}
                            onPress={() => router.push(`/citoyen/${c.citoyenId}` as Href)}
                        >
                            <Text style={styles.rankNum}>#{c.rank}</Text>
                            <View style={styles.rankInfo}>
                                <Text style={styles.rankName}>{c.name}</Text>
                                <Text style={styles.rankMeta}>{c.nbSignalements} signalements</Text>
                            </View>
                            <Text style={styles.rankPoints}>{c.points} pts</Text>
                        </Pressable>
                    ))}
                </View>
            )}

            {/* Activité des agents */}
            {stats?.volumeParAgent && stats.volumeParAgent.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Activité des agents</Text>
                    {stats.volumeParAgent.slice(0, 5).map(a => (
                        <View key={a.agentId} style={styles.agentRow}>
                            <View style={styles.agentInfo}>
                                <Text style={styles.agentName}>{a.name}</Text>
                                <Text style={styles.agentRole}>{a.role} • {a.perimetreVille || "—"}</Text>
                            </View>
                            <Text style={styles.agentCount}>{a.totalValides} validés</Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}