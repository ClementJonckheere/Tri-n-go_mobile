import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { me } from "../../src/api/client";
import { clearToken } from "../../src/auth/session";
import { useRouter } from "expo-router";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const u = await me();
      setUser(u);
    })();
  }, []);

  async function logout() {
    await clearToken();
    router.replace("/(auth)/login");
  }

  return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Bienvenue</Text>
        <Text style={{ marginTop: 8 }}>
          {user ? `Bonjour ${user.name} (${user.role})` : "Chargement..."}
        </Text>

        <View style={{ marginTop: 16 }}>
          <Button title="Se déconnecter" onPress={logout} />
        </View>
      </View>
  );
}
