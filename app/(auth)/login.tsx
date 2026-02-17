// app/(auth)/login.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Platform, KeyboardAvoidingView, useWindowDimensions, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter, type Href } from "expo-router";
import { login, me } from "../../src/api/client";

const COLORS = { white: "#FFFFFF", bg: "#F5F7FA", title: "#022B3A", subtitle: "#4f5b66", blue: "#06668C", green: "#70be55", border: "#d1d9e6", inputBg: "#F8FAFD", placeholder: "#9aa5b1", error: "#B00020" };

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
        <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={[styles.card, isWide ? styles.cardRow : styles.cardCol]}>
                    {/* LEFT (image) */}
                    <View style={[styles.left, isWide ? styles.leftWide : styles.leftNarrow]}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>Tri'n Go</Text>
                        </View>
                    </View>

                    {/* RIGHT (form) */}
                    <View style={styles.right}>
                        <View style={styles.header}>
                            <Text style={styles.eyebrow}>Bienvenue</Text>
                            <Text style={styles.title}>Nous sommes <Text style={styles.titleGreen}>Tri'n Go</Text></Text>
                            <Text style={styles.subtitle}>Connectez-vous pour déclarer les encombrants de votre ville.</Text>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.prefix}>✉</Text>
                                <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="votre@email.fr" placeholderTextColor={COLORS.placeholder} style={styles.input} />
                            </View>

                            <Text style={styles.label}>Mot de passe</Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.prefix}>🔒</Text>
                                <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Votre mot de passe" placeholderTextColor={COLORS.placeholder} style={styles.input} />
                            </View>

                            {!!msg && <Text style={styles.error}>{msg}</Text>}

                            <Pressable onPress={onSubmit} disabled={loading} style={[styles.btn, loading && { opacity: 0.7 }]}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Se connecter</Text>}
                            </Pressable>

                            <Text style={styles.footer}>
                                Pas encore de compte citoyen ?{" "}
                                <Text style={styles.footerLink} onPress={() => router.push("/register" as Href)}>Créer un compte</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg },
    scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingVertical: 32, alignItems: "center", justifyContent: "center" },
    card: { width: "100%", maxWidth: 1100, backgroundColor: COLORS.white, borderRadius: 28, overflow: "hidden", minHeight: 520, shadowColor: COLORS.blue, shadowOpacity: 0.15, shadowRadius: 24, shadowOffset: { width: 0, height: 18 }, elevation: 6 },
    cardRow: { flexDirection: "row" },
    cardCol: { flexDirection: "column" },
    left: { backgroundColor: COLORS.blue, justifyContent: "flex-start" },
    leftWide: { flexBasis: "42%", minHeight: 420 },
    leftNarrow: { width: "100%", height: 180 },
    logoCircle: { margin: 18, width: 70, height: 70, borderRadius: 999, backgroundColor: "rgba(235,242,250,0.9)", padding: 10, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
    logoText: { fontWeight: "800", color: COLORS.title, fontSize: 12 },
    right: { flex: 1, paddingHorizontal: 22, paddingVertical: 26, justifyContent: "center" },
    header: { marginBottom: 16 },
    eyebrow: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2.5, color: "#427AA1", fontWeight: "600", marginBottom: 6 },
    title: { fontSize: 26, fontWeight: "800", color: COLORS.title },
    titleGreen: { color: COLORS.green },
    subtitle: { marginTop: 8, color: COLORS.subtitle, fontSize: 14, lineHeight: 20 },
    form: { marginTop: 10 },
    label: { fontSize: 14, fontWeight: "700", color: "#1f2933", marginBottom: 6, marginTop: 12 },
    inputWrap: { position: "relative", borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.inputBg, borderRadius: 999, paddingLeft: 40, paddingRight: 16, paddingVertical: Platform.OS === "ios" ? 12 : 8 },
    prefix: { position: "absolute", left: 14, top: Platform.OS === "ios" ? 12 : 10, fontSize: 15, opacity: 0.65 },
    input: { fontSize: 14, color: "#111827" },
    error: { marginTop: 12, color: COLORS.error, fontSize: 13, fontWeight: "600" },
    btn: { marginTop: 18, borderRadius: 999, backgroundColor: COLORS.green, paddingVertical: 14, alignItems: "center", justifyContent: "center", shadowColor: COLORS.blue, shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
    btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    footer: { marginTop: 16, fontSize: 13, color: "#6b7785", textAlign: "center" },
    footerLink: { color: COLORS.blue, fontWeight: "800", textDecorationLine: "underline" },
});