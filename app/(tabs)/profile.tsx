// app/(tabs)/profile.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";

import { me, updateProfile, logout } from "../../src/api/client";
import type { User } from "../../src/types/user";
import { ROLE_LABELS } from "../../src/types/user";

const COLORS = {
    bg: "#F5F7FA",
    card: "#FFFFFF",
    title: "#022B3A",
    text: "#111827",
    muted: "#6b7785",
    border: "#E5E7EB",
    blue: "#06668C",
    green: "#70be55",
    danger: "#B00020",
    inputBg: "#F8FAFD",
};

export default function ProfileScreen() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Formulaire édition
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [adresse, setAdresse] = useState("");
    const [ville, setVille] = useState("");
    const [codePostal, setCodePostal] = useState("");

    async function load() {
        setError("");
        setLoading(true);
        try {
            const u = await me();
            setUser(u);
            // Pré-remplir le formulaire
            setName(u.name || "");
            setAdresse(u.adresse || "");
            setVille(u.ville || "");
            setCodePostal(u.codePostal || "");
        } catch (e: any) {
            setError(e?.message || "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    function startEdit() {
        setEditing(true);
        setSuccess("");
    }

    function cancelEdit() {
        // Reset aux valeurs originales
        if (user) {
            setName(user.name || "");
            setAdresse(user.adresse || "");
            setVille(user.ville || "");
            setCodePostal(user.codePostal || "");
        }
        setEditing(false);
    }

    async function saveProfile() {
        if (!name.trim()) {
            Alert.alert("Erreur", "Le nom est obligatoire");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const updated = await updateProfile({
                name: name.trim(),
                adresse: adresse.trim(),
                ville: ville.trim(),
                codePostal: codePostal.trim(),
            });
            setUser(updated);
            setEditing(false);
            setSuccess("Profil mis à jour !");
        } catch (e: any) {
            setError(e?.message || "Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    }

    async function handleLogout() {
        Alert.alert(
            "Déconnexion",
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Déconnexion",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace("/(auth)/login");
                    },
                },
            ]
        );
    }

    if (loading) {
        return (
            <View style={[styles.page, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.blue} />
                <Text style={styles.loadingText}>Chargement…</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.page}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.pageTitle}>Mon profil</Text>

                {/* Messages */}
                {!!error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
                {!!success && (
                    <View style={styles.successBox}>
                        <Text style={styles.successText}>{success}</Text>
                    </View>
                )}

                {/* Avatar & Infos principales */}
                <View style={styles.headerCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || "?"}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                            {ROLE_LABELS[user?.role || "citoyen"]}
                        </Text>
                    </View>
                </View>

                {/* Points */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{user?.pointsTotal ?? 0}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <Pressable
                        style={styles.statItem}
                        onPress={() => router.push("/(tabs)/points")}
                    >
                        <Text style={[styles.statValue, { color: COLORS.green }]}>
                            {((user?.pointsTotal ?? 0) * 0.05).toFixed(2)} €
                        </Text>
                        <Text style={styles.statLabel}>Cashback</Text>
                    </Pressable>
                </View>

                {/* Informations personnelles */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Informations personnelles</Text>
                        {!editing && (
                            <Pressable onPress={startEdit}>
                                <Text style={styles.editLink}>Modifier</Text>
                            </Pressable>
                        )}
                    </View>

                    {editing ? (
                        // Mode édition
                        <View style={styles.form}>
                            <Text style={styles.label}>Nom</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Votre nom"
                                placeholderTextColor={COLORS.muted}
                            />

                            <Text style={styles.label}>Adresse</Text>
                            <TextInput
                                style={styles.input}
                                value={adresse}
                                onChangeText={setAdresse}
                                placeholder="Votre adresse"
                                placeholderTextColor={COLORS.muted}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Ville</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={ville}
                                        onChangeText={setVille}
                                        placeholder="Ville"
                                        placeholderTextColor={COLORS.muted}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Code postal</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={codePostal}
                                        onChangeText={setCodePostal}
                                        placeholder="00000"
                                        placeholderTextColor={COLORS.muted}
                                        keyboardType="number-pad"
                                        maxLength={5}
                                    />
                                </View>
                            </View>

                            <View style={styles.editActions}>
                                <Pressable
                                    style={styles.cancelBtn}
                                    onPress={cancelEdit}
                                >
                                    <Text style={styles.cancelBtnText}>Annuler</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                                    onPress={saveProfile}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.saveBtnText}>Enregistrer</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        // Mode lecture
                        <View style={styles.infoList}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Nom</Text>
                                <Text style={styles.infoValue}>{user?.name || "—"}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{user?.email || "—"}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Adresse</Text>
                                <Text style={styles.infoValue}>{user?.adresse || "—"}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Ville</Text>
                                <Text style={styles.infoValue}>{user?.ville || "—"}</Text>
                            </View>
                            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.infoLabel}>Code postal</Text>
                                <Text style={styles.infoValue}>{user?.codePostal || "—"}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actionsCard}>
                    <Pressable
                        style={styles.actionRow}
                        onPress={() => router.push("/(tabs)/signalements")}
                    >
                        <Text style={styles.actionIcon}>📋</Text>
                        <Text style={styles.actionText}>Mes signalements</Text>
                        <Text style={styles.actionArrow}>→</Text>
                    </Pressable>

                    <Pressable
                        style={styles.actionRow}
                        onPress={() => router.push("/(tabs)/points")}
                    >
                        <Text style={styles.actionIcon}>🎁</Text>
                        <Text style={styles.actionText}>Utiliser mes points</Text>
                        <Text style={styles.actionArrow}>→</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.actionRow, { borderBottomWidth: 0 }]}
                        onPress={() => router.push("/(tabs)/map")}
                    >
                        <Text style={styles.actionIcon}>🗺️</Text>
                        <Text style={styles.actionText}>Carte des encombrants</Text>
                        <Text style={styles.actionArrow}>→</Text>
                    </Pressable>
                </View>

                {/* Déconnexion */}
                <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutBtnText}>Se déconnecter</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg },
    container: { padding: 16, gap: 14, paddingBottom: 30 },
    center: { alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 10, color: COLORS.muted },

    pageTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.title,
    },

    // Messages
    errorBox: {
        backgroundColor: "rgba(176,0,32,0.1)",
        padding: 12,
        borderRadius: 12,
    },
    errorText: { color: COLORS.danger, fontWeight: "700" },
    successBox: {
        backgroundColor: "rgba(112,190,85,0.15)",
        padding: 12,
        borderRadius: 12,
    },
    successText: { color: COLORS.green, fontWeight: "700" },

    // Header card
    headerCard: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 999,
        backgroundColor: COLORS.blue,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    avatarText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "900",
    },
    userName: {
        fontSize: 20,
        fontWeight: "900",
        color: COLORS.title,
    },
    userEmail: {
        marginTop: 4,
        color: COLORS.muted,
        fontWeight: "600",
    },
    roleBadge: {
        marginTop: 10,
        backgroundColor: "rgba(6,102,140,0.1)",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
    },
    roleText: {
        color: COLORS.blue,
        fontWeight: "800",
        fontSize: 12,
        textTransform: "uppercase",
    },

    // Stats card
    statsCard: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 16,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "900",
        color: COLORS.title,
    },
    statLabel: {
        marginTop: 4,
        color: COLORS.muted,
        fontWeight: "600",
        fontSize: 13,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 16,
    },

    // Card
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: COLORS.title,
    },
    editLink: {
        color: COLORS.blue,
        fontWeight: "800",
    },

    // Info list
    infoList: {},
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    infoLabel: {
        color: COLORS.muted,
        fontWeight: "600",
    },
    infoValue: {
        color: COLORS.text,
        fontWeight: "700",
    },

    // Form
    form: {},
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.title,
        marginBottom: 6,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: COLORS.text,
    },
    row: {
        flexDirection: "row",
        gap: 10,
    },
    editActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
    },
    cancelBtnText: {
        color: COLORS.muted,
        fontWeight: "800",
    },
    saveBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: COLORS.green,
        alignItems: "center",
    },
    saveBtnText: {
        color: "#fff",
        fontWeight: "800",
    },

    // Actions card
    actionsCard: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    actionIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    actionText: {
        flex: 1,
        color: COLORS.text,
        fontWeight: "700",
    },
    actionArrow: {
        color: COLORS.muted,
        fontSize: 16,
    },

    // Logout
    logoutBtn: {
        backgroundColor: "rgba(176,0,32,0.1)",
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: "center",
    },
    logoutBtnText: {
        color: COLORS.danger,
        fontWeight: "800",
    },

    // Version
    version: {
        textAlign: "center",
        color: COLORS.muted,
        fontSize: 12,
        marginTop: 8,
    },
});