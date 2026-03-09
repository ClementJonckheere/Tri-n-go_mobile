// app/(tabs-agent)/profile-agent.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { me, logout } from "../../src/api/client";
import type { User } from "../../src/types/user";
import { ROLE_LABELS } from "../../src/types/user";
import { COLORS } from "../../src/styles";
import { profileStyles as styles } from "../../src/styles/profileStyles";

export default function ProfileAgentScreen() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        me()
            .then(setUser)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    async function handleLogout() {
        Alert.alert(
            "Déconnexion",
            "Êtes-vous sûr ?",
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
            </View>
        );
    }

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.container}>
            {/* Header avec avatar */}
            <View style={styles.headerCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {ROLE_LABELS[user?.role || "agent"]}
                    </Text>
                </View>
            </View>

            {/* Informations */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Informations</Text>
                </View>
                <View style={styles.infoList}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Périmètre</Text>
                        <Text style={styles.infoValue}>{user?.perimetreVille || "Aucun"}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                </View>
            </View>

            {/* Déconnexion */}
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Se déconnecter</Text>
            </Pressable>

            {/* Version */}
            <Text style={styles.version}>Tri'n Go Pro v1.0.0</Text>
        </ScrollView>
    );
}