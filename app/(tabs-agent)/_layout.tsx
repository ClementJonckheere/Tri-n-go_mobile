// app/(tabs-agent)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, type Href } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { me } from "../../src/api/client";
import { clearToken, getToken } from "../../src/auth/session";
import type { User } from "../../src/types/user";

const COLORS = {
  green: "#70be55",
  blue: "#06668C",
  muted: "#6b7785",
  bg: "#F5F7FA",
};

export default function TabsAgentLayout() {
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          setAuthorized(false);
          setReady(true);
          return;
        }
        const userData = await me();
        if (!["agent", "chef_agent", "gestionnaire"].includes(userData.role)) {
          setAuthorized(false);
          setReady(true);
          return;
        }
        setUser(userData);
        setAuthorized(true);
        setReady(true);
      } catch (e) {
        await clearToken();
        setAuthorized(false);
        setReady(true);
      }
    })();
  }, []);

  if (!ready)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.bg,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  if (!authorized) return <Redirect href={"/(auth)/login" as Href} />;

  const isGestionnaire = user?.role === "gestionnaire";

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontWeight: "800", color: "#022B3A" },
        tabBarActiveTintColor: COLORS.blue,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#E5E7EB",
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontWeight: "700", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerTitle: "Tri'n Go Pro",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gestion"
        options={{
          title: "Signalements",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Carte",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Utilisateurs",
          href: isGestionnaire ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile-agent"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="citoyen/[id]"
        options={{ href: null, title: "Fiche citoyen" }}
      />
      <Tabs.Screen
        name="user-create"
        options={{ href: null, title: "Créer utilisateur" }}
      />
    </Tabs>
  );
}
