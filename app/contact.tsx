// app/contact.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StatusBar,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { contactStyles as styles } from "../src/styles/welcomeStyles";
import { COLORS } from "../src/styles/colors";

export default function ContactScreen() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const isFormValid = name.trim() && email.trim() && message.trim();

    const handleSubmit = async () => {
        if (!isFormValid) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
            return;
        }

        // Validation email simple
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Erreur", "Veuillez entrer une adresse email valide.");
            return;
        }

        setLoading(true);

        // Simulation d'envoi (remplacer par un vrai appel API)
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 1500);
    };

    // Écran de succès
    if (success) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contact</Text>
                </View>

                <View style={styles.successContainer}>
                    <Text style={styles.successEmoji}>✅</Text>
                    <Text style={styles.successTitle}>Message envoyé !</Text>
                    <Text style={styles.successText}>
                        Merci de nous avoir contacté.{"\n"}
                        Notre équipe vous répondra dans les plus brefs délais.
                    </Text>
                    <TouchableOpacity
                        style={styles.successButton}
                        onPress={() => router.push("/welcome")}
                    >
                        <Text style={styles.successButtonText}>Retour à l'accueil</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contactez-nous</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Intro */}
                    <View style={styles.intro}>
                        <Text style={styles.introEmoji}>💬</Text>
                        <Text style={styles.introTitle}>Une question ?</Text>
                        <Text style={styles.introText}>
                            Notre équipe est là pour vous aider.{"\n"}
                            Remplissez le formulaire ci-dessous.
                        </Text>
                    </View>

                    {/* Formulaire */}
                    <View style={styles.form}>
                        {/* Nom */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Nom complet <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedField === "name" && styles.inputFocused,
                                ]}
                                placeholder="Jean Dupont"
                                placeholderTextColor={COLORS.placeholder}
                                value={name}
                                onChangeText={setName}
                                onFocus={() => setFocusedField("name")}
                                onBlur={() => setFocusedField(null)}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Email <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedField === "email" && styles.inputFocused,
                                ]}
                                placeholder="jean.dupont@email.fr"
                                placeholderTextColor={COLORS.placeholder}
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => setFocusedField(null)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Sujet */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Sujet</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedField === "subject" && styles.inputFocused,
                                ]}
                                placeholder="Ex: Question sur les points"
                                placeholderTextColor={COLORS.placeholder}
                                value={subject}
                                onChangeText={setSubject}
                                onFocus={() => setFocusedField("subject")}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>

                        {/* Message */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Message <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    focusedField === "message" && styles.inputFocused,
                                ]}
                                placeholder="Décrivez votre demande..."
                                placeholderTextColor={COLORS.placeholder}
                                value={message}
                                onChangeText={setMessage}
                                onFocus={() => setFocusedField("message")}
                                onBlur={() => setFocusedField(null)}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Bouton envoyer */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!isFormValid || loading) && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={!isFormValid || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.submitButtonText}>Envoyer le message</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Contact direct */}
                    <View style={styles.contactCards}>
                        <View style={styles.contactCard}>
                            <View style={styles.contactCardIcon}>
                                <Text style={styles.contactCardIconText}>📧</Text>
                            </View>
                            <View style={styles.contactCardContent}>
                                <Text style={styles.contactCardTitle}>Email</Text>
                                <Text style={styles.contactCardValue}>contact@tringo.fr</Text>
                            </View>
                        </View>

                        <View style={styles.contactCard}>
                            <View style={styles.contactCardIcon}>
                                <Text style={styles.contactCardIconText}>📞</Text>
                            </View>
                            <View style={styles.contactCardContent}>
                                <Text style={styles.contactCardTitle}>Téléphone</Text>
                                <Text style={styles.contactCardValue}>03 22 00 00 00</Text>
                            </View>
                        </View>

                        <View style={styles.contactCard}>
                            <View style={styles.contactCardIcon}>
                                <Text style={styles.contactCardIconText}>📍</Text>
                            </View>
                            <View style={styles.contactCardContent}>
                                <Text style={styles.contactCardTitle}>Adresse</Text>
                                <Text style={styles.contactCardValue}>Mairie d'Amiens, 80000</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}