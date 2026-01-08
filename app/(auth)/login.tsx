import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { login, me, hasToken, logout } from "../../src/api/client";

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("test@gmail.com");
    const [password, setPassword] = useState("azerty1234");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string>("");

    // Auto-login si token déjà présent
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setMsg("Vérification session...");
                const tokenExists = await hasToken();
                if (!tokenExists) return;

                const u = await me(); // si token invalide -> 401
                // OK -> on va sur l'app
                router.replace("/(tabs)");
            } catch (e) {
                // token expiré/invalide -> on clear et reste sur login
                await logout();
            } finally {
                setLoading(false);
                setMsg("");
            }
        })();
    }, []);

    async function onSubmit() {
        try {
            setLoading(true);
            setMsg("");

            if (!email.trim() || !password) {
                setMsg("Email et mot de passe requis.");
                return;
            }

            await login(email.trim(), password);
            // Vérif user (optionnel mais propre)
            await me();

            router.replace("/(tabs)");
        } catch (e: any) {
            setMsg(e?.message || "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 6 }}>
                Connexion
            </Text>
            <Text style={{ opacity: 0.7, marginBottom: 18 }}>
                Connecte-toi pour accéder à ton espace citoyen.
            </Text>

            <Text style={{ marginBottom: 6 }}>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="email@exemple.com"
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 12,
                }}
            />

            <Text style={{ marginBottom: 6 }}>Mot de passe</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 16,
                }}
            />

            {!!msg && (
                <Text style={{ color: "#b00020", marginBottom: 12 }}>{msg}</Text>
            )}

            <Pressable
                onPress={onSubmit}
                disabled={loading}
                style={{
                    backgroundColor: loading ? "#999" : "#111",
                    padding: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 10,
                }}
            >
                {loading && <ActivityIndicator color="#fff" />}
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Se connecter
                </Text>
            </Pressable>

            <Text style={{ marginTop: 14, opacity: 0.7 }}>
                (Register optionnel — on l’ajoutera après)
            </Text>
        </View>
    );
}
