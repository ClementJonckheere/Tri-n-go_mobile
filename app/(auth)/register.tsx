// app/(auth)/register.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TextInput,
    Pressable,
    Platform,
    KeyboardAvoidingView,
    useWindowDimensions,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import { login } from "../../src/api/client";
import { register as apiRegister } from "../../src/api/registerClient";

const COLORS = {
    white: "#FFFFFF",
    bg: "#F5F7FA",
    title: "#022B3A",
    subtitle: "#4f5b66",
    blue: "#06668C",
    green: "#70be55",
    border: "#d1d9e6",
    inputBg: "#F8FAFD",
    placeholder: "#9aa5b1",
    error: "#B00020",
};

export default function RegisterScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWide = width >= 900;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [adresse, setAdresse] = useState("");
    const [ville, setVille] = useState("");
    const [codePostal, setCodePostal] = useState("");

    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    function validate() {
        if (!name.trim()) return "Nom obligatoire";
        if (!email.trim()) return "Email obligatoire";
        if (!password || password.length < 6) return "Mot de passe (min 6 caractères)";
        if (!adresse.trim()) return "Adresse obligatoire";
        if (!ville.trim()) return "Ville obligatoire";
        if (!codePostal.trim()) return "Code postal obligatoire";
        return null;
    }

    async function onSubmit() {
        const err = validate();
        if (err) {
            setMsg(err);
            return;
        }

        try {
            setMsg("");
            setLoading(true);

            // 1) Register
            await apiRegister({
                name: name.trim(),
                email: email.trim(),
                password,
                adresse: adresse.trim(),
                ville: ville.trim(),
                codePostal: codePostal.trim(),
            });

            // 2) Auto-login
            await login(email.trim(), password);

            // 3) Go to app
            router.replace("/(tabs)");
        } catch (e: any) {
            setMsg(e?.message || "Erreur inconnue");
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
                            <Text style={styles.logoText}>Tri’n Go</Text>
                        </View>
                    </ImageBackground>

                    {/* RIGHT */}
                    <View style={styles.right}>
                        <View style={styles.header}>
                            <Text style={styles.eyebrow}>Inscription</Text>
                            <Text style={styles.title}>
                                Créer un compte <Text style={styles.titleGreen}>citoyen</Text>
                            </Text>
                            <Text style={styles.subtitle}>
                                Remplissez vos informations pour commencer à déclarer des encombrants.
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Nom</Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.prefix}>👤</Text>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Votre nom"
                                    placeholderTextColor={COLORS.placeholder}
                                    style={styles.input}
                                />
                            </View>

                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.prefix}>✉</Text>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholder="votre@email.fr"
                                    placeholderTextColor={COLORS.placeholder}
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
                                    placeholder="Min 6 caractères"
                                    placeholderTextColor={COLORS.placeholder}
                                    style={styles.input}
                                />
                            </View>

                            <Text style={styles.label}>Adresse</Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.prefix}>📍</Text>
                                <TextInput
                                    value={adresse}
                                    onChangeText={setAdresse}
                                    placeholder="Ex: 12 rue de la Paix"
                                    placeholderTextColor={COLORS.placeholder}
                                    style={styles.input}
                                />
                            </View>

                            {/* Ville + Code postal sur la même ligne */}
                            <View style={styles.row2}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Ville</Text>
                                    <View style={styles.inputWrap}>
                                        <Text style={styles.prefix}>🏙️</Text>
                                        <TextInput
                                            value={ville}
                                            onChangeText={setVille}
                                            placeholder="Amiens"
                                            placeholderTextColor={COLORS.placeholder}
                                            style={styles.input}
                                        />
                                    </View>
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Code postal</Text>
                                    <View style={styles.inputWrap}>
                                        <Text style={styles.prefix}>#</Text>
                                        <TextInput
                                            value={codePostal}
                                            onChangeText={setCodePostal}
                                            placeholder="80000"
                                            placeholderTextColor={COLORS.placeholder}
                                            keyboardType="number-pad"
                                            style={styles.input}
                                        />
                                    </View>
                                </View>
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
                                    <Text style={styles.btnText}>Créer mon compte</Text>
                                )}
                            </Pressable>

                            <Text style={styles.footer}>
                                Déjà un compte ?{" "}
                                <Text
                                    style={styles.footerLink}
                                    onPress={() => router.replace("/(auth)/login")}
                                >
                                    Se connecter
                                </Text>
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

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingVertical: 32,
        alignItems: "center",
        justifyContent: "flex-start",
    },

    card: {
        width: "100%",
        maxWidth: 1100,
        backgroundColor: COLORS.white,
        borderRadius: 28,
        overflow: "hidden",
        minHeight: 620,
        shadowColor: COLORS.blue,
        shadowOpacity: 0.15,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 18 },
        elevation: 6,
    },
    cardRow: { flexDirection: "row" },
    cardCol: { flexDirection: "column" },

    left: { justifyContent: "flex-start" },
    leftWide: { flexBasis: "42%", minHeight: 520 },
    leftNarrow: { width: "100%", height: 220 },
    leftImg: { resizeMode: "cover" },

    logoCircle: {
        margin: 18,
        width: 70,
        height: 70,
        borderRadius: 999,
        backgroundColor: "rgba(235,242,250,0.9)",
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    logoText: {
        fontWeight: "800",
        color: COLORS.title,
        fontSize: 12,
    },

    right: {
        flex: 1,
        paddingHorizontal: 22,
        paddingVertical: 26,
        justifyContent: "center",
    },

    header: { marginBottom: 16 },
    eyebrow: {
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: 2.5,
        color: "#427AA1",
        fontWeight: "600",
        marginBottom: 6,
    },
    title: { fontSize: 26, fontWeight: "800", color: COLORS.title },
    titleGreen: { color: COLORS.green },
    subtitle: { marginTop: 8, color: COLORS.subtitle, fontSize: 14, lineHeight: 20 },

    form: { marginTop: 10 },

    label: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1f2933",
        marginBottom: 6,
        marginTop: 12,
    },

    inputWrap: {
        position: "relative",
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBg,
        borderRadius: 999,
        paddingLeft: 40,
        paddingRight: 16,
        paddingVertical: Platform.OS === "ios" ? 12 : 8,
    },
    prefix: {
        position: "absolute",
        left: 14,
        top: Platform.OS === "ios" ? 12 : 10,
        fontSize: 15,
        opacity: 0.65,
    },
    input: { fontSize: 14, color: "#111827" },

    row2: {
        marginTop: 6,
        flexDirection: "row",
        gap: 12,
    },

    error: { marginTop: 12, color: COLORS.error, fontSize: 13, fontWeight: "600" },

    btn: {
        marginTop: 18,
        borderRadius: 999,
        backgroundColor: COLORS.green,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.blue,
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 4,
    },
    btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

    footer: {
        marginTop: 16,
        fontSize: 13,
        color: "#6b7785",
        textAlign: "center",
    },
    footerLink: {
        color: COLORS.blue,
        fontWeight: "800",
        textDecorationLine: "underline",
    },
});
