// app/(auth)/login.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    useWindowDimensions,
    ActivityIndicator,
    ScrollView,
    ImageBackground,
    Platform,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { login, me } from "../../src/api/client";
import { authStyles as styles } from "../../src/styles";

export default function LoginScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWide = width >= 900;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit() {
        if (!email.trim() || !password) {
            setMsg("Email et mot de passe requis");
            return;
        }
        try {
            setMsg("");
            setLoading(true);

            // 1. Login
            console.log("[LOGIN] Tentative de connexion...");
            const loginResult = await login(email.trim(), password);
            console.log("[LOGIN] Résultat login:", JSON.stringify(loginResult));

            // 2. Récupérer les infos utilisateur
            console.log("[LOGIN] Récupération infos utilisateur...");
            const user = await me();
            console.log("[LOGIN] User role:", user.role);

            // 3. Redirection selon le rôle
            const isAgentOrGestionnaire = ["agent", "chef_agent", "gestionnaire"].includes(user.role);
            console.log("[LOGIN] Est agent/gestionnaire:", isAgentOrGestionnaire);

            if (isAgentOrGestionnaire) {
                console.log("[LOGIN] Redirection vers (tabs-agent)");
                router.replace("/(tabs-agent)" as Href);
            } else {
                console.log("[LOGIN] Redirection vers (tabs)");
                router.replace("/(tabs)" as Href);
            }
        } catch (e: unknown) {
            const err = e as Error;
            console.log("[LOGIN] Erreur:", err?.message);
            setMsg(err?.message || "Erreur de connexion");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.page}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.card, isWide ? styles.cardRow : styles.cardCol]}>
                    {/* LEFT (image) */}
                    <ImageBackground
                        source={require("../../assets/images/malte.jpg")}
                        style={[styles.left, isWide ? styles.leftWide : styles.leftNarrow]}
                        imageStyle={styles.leftImg}
                    >
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>Tri'n Go</Text>
                        </View>
                    </ImageBackground>

                    {/* RIGHT (form) */}
                    <View style={styles.right}>
                        <View style={styles.header}>
                            <Text style={styles.eyebrow}>Bienvenue</Text>
                            <Text style={styles.title}>
                                Nous sommes <Text style={styles.titleGreen}>Tri'n Go</Text>
                            </Text>
                            <Text style={styles.subtitle}>
                                Connectez-vous pour déclarer les encombrants de votre ville.
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.prefix}>✉</Text>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholder="votre@email.fr"
                                    placeholderTextColor="#9aa5b1"
                                    style={styles.input}
                                />
                            </View>

                            <Text style={styles.label}>Mot de passe</Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.prefix}>🔒</Text>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    placeholder="Votre mot de passe"
                                    placeholderTextColor="#9aa5b1"
                                    style={styles.input}
                                />
                            </View>

                            {!!msg && <Text style={styles.error}>{msg}</Text>}

                            <Pressable
                                onPress={onSubmit}
                                disabled={loading}
                                style={[styles.btn, loading && { opacity: 0.7 }]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.btnText}>Se connecter</Text>
                                )}
                            </Pressable>

                            <Text style={styles.footer}>
                                Pas encore de compte citoyen ?{" "}
                                <Text
                                    style={styles.footerLink}
                                    onPress={() => router.push("/register" as Href)}
                                >
                                    Créer un compte
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}