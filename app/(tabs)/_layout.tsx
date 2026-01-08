import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Tabs, Redirect, type Href } from "expo-router";
import { getToken, clearToken } from "../../src/auth/session";
import { me } from "../../src/api/client";

export default function TabsLayout() {
    const [ready, setReady] = useState(false);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setAuthorized(false);
                    setReady(true);
                    return;
                }

                // Vérifie que le token est encore valide côté API
                await me();

                setAuthorized(true);
                setReady(true);
            } catch (e) {
                // token invalide => purge + retour login
                await clearToken();
                setAuthorized(false);
                setReady(true);
            }
        })();
    }, []);

    if (!ready) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!authorized) {
        const href: Href = "/(auth)/login";
        return <Redirect href={href} />;
    }

    return (
        <Tabs screenOptions={{ headerShown: true }}>
            <Tabs.Screen name="index" options={{ title: "Accueil" }} />
            <Tabs.Screen name="signalements" options={{ title: "Signalements" }} />
            <Tabs.Screen name="profil" options={{ title: "Profil" }} />
        </Tabs>
    );
}
