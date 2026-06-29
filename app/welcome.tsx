// app/welcome.tsx
import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { welcomeStyles as styles } from "../src/styles/welcomeStyles";

export default function WelcomeScreen() {
    const router = useRouter();

    const features = [
        {
            icon: "📸",
            title: "Déclarez en 30 secondes",
            desc: "Photo, adresse géolocalisée, type d'encombrant — c'est tout !",
        },
        {
            icon: "📍",
            title: "Suivi en temps réel",
            desc: "Suivez l'avancement de votre signalement à chaque étape.",
        },
        {
            icon: "🎁",
            title: "Gagnez des points",
            desc: "Chaque signalement validé vous rapporte des points convertibles en cashback.",
        },
        {
            icon: "💰",
            title: "Cashback déchèterie",
            desc: "Utilisez vos points dans les déchèteries partenaires.",
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logo}>
                    <Text style={styles.logoIcon}>♻️</Text>
                    <Text style={styles.logoText}>Tri'n Go</Text>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={styles.btnContact}
                        onPress={() => router.push("/contact")}
                    >
                        <Text style={styles.btnContactText}>Contact</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnLogin}
                        onPress={() => router.push("/(auth)/login")}
                    >
                        <Text style={styles.btnLoginText}>Connexion</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Image
                        source={require("../assets/images/ordure.png")}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.heroTitle}>
                        Signalez un encombrant,{"\n"}
                        <Text style={styles.heroTitleHighlight}>gagnez des récompenses</Text>
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        L'application qui récompense les citoyens engagés pour des rues plus propres.
                    </Text>
                </View>

                {/* CTA Buttons */}
                <View style={styles.ctaSection}>
                    <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={() => router.push("/(auth)/register")}
                    >
                        <Text style={styles.btnPrimaryText}>Créer un compte gratuit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnSecondary}
                        onPress={() => router.push("/(auth)/login")}
                    >
                        <Text style={styles.btnSecondaryText}>J'ai déjà un compte</Text>
                    </TouchableOpacity>
                </View>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <View key={index} style={styles.featureCard}>
                                <View style={styles.featureIcon}>
                                    <Text style={styles.featureIconText}>{feature.icon}</Text>
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.statsSection}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>500+</Text>
                        <Text style={styles.statLabel}>Signalements</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>3,5 tonnes</Text>
                        <Text style={styles.statLabel}>d’encombrants collectés</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>150+</Text>
                        <Text style={styles.statLabel}>Citoyens actifs</Text>
                    </View>

                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Une question ?{" "}
                        <Text
                            style={styles.footerLink}
                            onPress={() => router.push("/contact")}
                        >
                            Contactez-nous
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}