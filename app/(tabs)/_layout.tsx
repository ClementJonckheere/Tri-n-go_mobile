// app/(tabs)/_layout.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Tabs, Redirect, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getToken, clearToken } from "../../src/auth/session";
import { me } from "../../src/api/client";

const COLORS = {
    green: "#70be55",
    blue: "#06668C",
    muted: "#6b7785",
    bg: "#F5F7FA",
};

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function TabsLayout() {
    const [ready, setReady] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [isAgent, setIsAgent] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                console.log("[TABS-CITOYEN] Vérification auth...");
                const token = await getToken();

                if (!token) {
                    console.log("[TABS-CITOYEN] Pas de token");
                    setAuthorized(false);
                    setReady(true);
                    return;
                }

                console.log("[TABS-CITOYEN] Token trouvé, appel me()...");
                const user = await me();
                console.log("[TABS-CITOYEN] User role:", user.role);

                // Si c'est un agent/gestionnaire, rediriger vers (tabs-agent)
                if (["agent", "chef_agent", "gestionnaire"].includes(user.role)) {
                    console.log("[TABS-CITOYEN] C'est un agent, redirection...");
                    setIsAgent(true);
                    setAuthorized(false);
                    setReady(true);
                    return;
                }

                console.log("[TABS-CITOYEN] C'est un citoyen, autorisé");
                setAuthorized(true);
                setReady(true);
            } catch (e) {
                console.log("[TABS-CITOYEN] Erreur:", e);
                // token invalide => purge + retour login
                await clearToken();
                setAuthorized(false);
                setReady(true);
            }
        })();
    }, []);

    if (!ready) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg }}>
                <ActivityIndicator size="large" color={COLORS.blue} />
            </View>
        );
    }

    // Rediriger les agents vers leur interface
    if (isAgent) {
        return <Redirect href={"/(tabs-agent)" as Href} />;
    }

    if (!authorized) {
        return <Redirect href={"/(auth)/login" as Href} />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: "#fff",
                },
                headerTitleStyle: {
                    fontWeight: "800",
                    color: "#022B3A",
                },
                tabBarActiveTintColor: COLORS.green,
                tabBarInactiveTintColor: COLORS.muted,
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopColor: "#E5E7EB",
                    paddingBottom: 4,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontWeight: "700",
                    fontSize: 11,
                },
            }}
        >
            {/* Accueil / Dashboard */}
            <Tabs.Screen
                name="index"
                options={{
                    title: "Accueil",
                    headerTitle: "Tri'n Go",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            {/* Liste des signalements */}
            <Tabs.Screen
                name="signalements"
                options={{
                    title: "Signalements",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    ),
                }}
            />

            {/* Nouveau signalement */}
            <Tabs.Screen
                name="new-signalement"
                options={{
                    title: "Déclarer",
                    tabBarIcon: ({ color, size }) => (
                        <View
                            style={{
                                backgroundColor: COLORS.green,
                                width: 48,
                                height: 48,
                                borderRadius: 999,
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 16,
                                shadowColor: COLORS.green,
                                shadowOpacity: 0.4,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 4,
                            }}
                        >
                            <Ionicons name="add" size={28} color="#fff" />
                        </View>
                    ),
                    tabBarLabel: () => null, // Pas de label pour ce bouton spécial
                }}
            />

            {/* Carte */}
            <Tabs.Screen
                name="map"
                options={{
                    title: "Carte",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map" size={size} color={color} />
                    ),
                }}
            />

            {/* Profil */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />

            {/* Points - caché dans les tabs mais accessible */}
            <Tabs.Screen
                name="points"
                options={{
                    href: null, // Ne pas afficher dans la tab bar
                    title: "Mes points",
                }}
            />

            {/* Détail signalement - route dynamique cachée */}
            <Tabs.Screen
                name="signalement/[id]"
                options={{
                    href: null, // Ne pas afficher dans la tab bar
                    title: "Détail",
                }}
            />
        </Tabs>
    );
}