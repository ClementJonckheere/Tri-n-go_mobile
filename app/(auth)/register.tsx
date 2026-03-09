// app/(auth)/register.tsx
import React, { useState } from "react";
import {
    View,
    Text,
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
import { login, register } from "../../src/api/client";
import { COLORS } from "../../src/styles/colors";
import { authStyles as styles } from "../../src/styles/authStyles";

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
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Email invalide";
        if (!password || password.length < 6) return "Mot de passe (min 6 caractères)";
        if (!adresse.trim()) return "Adresse obligatoire";
        if (!ville.trim()) return "Ville obligatoire";
        if (!codePostal.trim()) return "Code postal obligatoire";
        if (!/^\d{5}$/.test(codePostal.trim())) return "Code postal invalide (5 chiffres)";
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

            await register({
                name: name.trim(),
                email: email.trim(),
                password,
                adresse: adresse.trim(),
                ville: ville.trim(),
                codePostal: codePostal.trim(),
            });

            await login(email.trim(), password);

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
                    <ImageBackground
                        source={require("../../assets/images/malte.jpg")}
                        style={[styles.left, isWide ? styles.leftWide : styles.leftNarrow]}
                        imageStyle={styles.leftImg}
                    >
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>Tri'n Go</Text>
                        </View>
                    </ImageBackground>

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
                                <TextInput
                                    value={adresse}
                                    onChangeText={setAdresse}
                                    placeholder="Ex: 12 rue de la Paix"
                                    placeholderTextColor={COLORS.placeholder}
                                    style={styles.input}
                                />
                            </View>

                            <View style={styles.row2}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Ville</Text>
                                    <View style={styles.inputWrap}>
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
                                        <TextInput
                                            value={codePostal}
                                            onChangeText={setCodePostal}
                                            placeholder="80000"
                                            placeholderTextColor={COLORS.placeholder}
                                            keyboardType="number-pad"
                                            maxLength={5}
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