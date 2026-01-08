import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { me, logout, hasToken } from "../../src/api/client";

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userLabel, setUserLabel] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const tokenExists = await hasToken();
        if (!tokenExists) {
          router.replace("/(auth)/login");
          return;
        }
        const u = await me();
        setUserLabel(`${u.name} (${u.role})`);
      } catch (e) {
        await logout();
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  if (loading) return <View style={{ padding: 40 }}><Text>Chargement…</Text></View>;

  return (
      <View style={{ padding: 40 }}>
        <Text style={{ marginBottom: 12, fontSize: 18 }}>Bonjour {userLabel}</Text>
        <Button title="Se déconnecter" onPress={onLogout} />
      </View>
  );
}
