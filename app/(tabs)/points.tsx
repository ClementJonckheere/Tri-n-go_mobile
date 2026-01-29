// app/(tabs)/points.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
    Alert,
    Switch,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";

import {
    getPointsInfo,
    usePoints,
    type PointsInfo,
    type UsePointsResult,
} from "../../src/api/client";

const COLORS = {
    bg: "#F5F7FA",
    card: "#FFFFFF",
    title: "#022B3A",
    text: "#111827",
    muted: "#6b7785",
    border: "#E5E7EB",
    blue: "#06668C",
    green: "#70be55",
    greenLight: "rgba(112,190,85,0.12)",
    danger: "#B00020",
    inputBg: "#F8FAFD",
};

// Barre de progression
function ProgressBar({ progress }: { progress: number }) {
    const width = Math.min(100, Math.max(0, progress));
    return (
        <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${width}%` }]} />
        </View>
    );
}

export default function PointsScreen() {
    const router = useRouter();

    const [info, setInfo] = useState<PointsInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Formulaire
    const [pointsToUse, setPointsToUse] = useState("");
    const [decheterieAccount, setDecheterieAccount] = useState("");
    const [saveAccount, setSaveAccount] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Résultat après utilisation
    const [result, setResult] = useState<UsePointsResult | null>(null);

    async function load() {
        setError("");
        setLoading(true);
        try {
            const data = await getPointsInfo();
            setInfo(data);
            setPointsToUse(data.pointsTotal.toString());
            if (data.decheterieAccountNumber) {
                setDecheterieAccount(data.decheterieAccountNumber);
            }
        } catch (e: any) {
            setError(e?.message || "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    // Calcul du montant en euros
    const pointsNum = parseInt(pointsToUse) || 0;
    const maxPoints = info?.pointsTotal ?? 0;
    const rate = info?.cashbackRate ?? 0.05;
    const eurosValue = Math.min(pointsNum, maxPoints) * rate;

    async function onSubmit() {
        if (!decheterieAccount.trim()) {
            Alert.alert("Erreur", "Veuillez saisir votre numéro de compte déchèterie");
            return;
        }

        if (pointsNum <= 0) {
            Alert.alert("Erreur", "Veuillez saisir un nombre de points valide");
            return;
        }

        if (pointsNum > maxPoints) {
            Alert.alert("Erreur", `Vous n'avez que ${maxPoints} points disponibles`);
            return;
        }

        setSubmitting(true);
        try {
            const res = await usePoints({
                pointsToUse: pointsNum,
                decheterieAccountNumber: decheterieAccount.trim(),
                saveAccount,
            });
            setResult(res);
        } catch (e: any) {
            Alert.alert("Erreur", e?.message || "Erreur lors de l'utilisation des points");
        } finally {
            setSubmitting(false);
        }
    }

    // Écran de confirmation
    if (result) {
        return (
            <View style={styles.page}>
                <View style={styles.successCard}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successTitle}>Points utilisés !</Text>

                    <View style={styles.successDetails}>
                        <View style={styles.successRow}>
                            <Text style={styles.successLabel}>Points utilisés</Text>
                            <Text style={styles.successValue}>{result.pointsUsed} pts</Text>
                        </View>
                        <View style={styles.successRow}>
                            <Text style={styles.successLabel}>Crédit déchèterie</Text>
                            <Text style={styles.successValueGreen}>{result.euros.toFixed(2)} €</Text>
                        </View>
                        <View style={styles.successRow}>
                            <Text style={styles.successLabel}>Compte crédité</Text>
                            <Text style={styles.successValue}>{result.decheterieAccountNumber}</Text>
                        </View>
                        <View style={[styles.successRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.successLabel}>Nouveau solde</Text>
                            <Text style={styles.successValue}>{result.newPointsTotal} pts</Text>
                        </View>
                    </View>

                    <Pressable
                        style={styles.successBtn}
                        onPress={() => router.replace("/(tabs)")}
                    >
                        <Text style={styles.successBtnText}>Retour à l'accueil</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.page, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.blue} />
                <Text style={styles.loadingText}>Chargement…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.page, styles.center]}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retryBtn} onPress={load}>
                    <Text style={styles.retryBtnText}>Réessayer</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.page}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.pageTitle}>Utiliser mes points</Text>

                {/* Résumé points */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Solde disponible</Text>
                    <Text style={styles.summaryValue}>{info?.pointsTotal ?? 0} pts</Text>

                    <View style={styles.summaryMeta}>
                        <Text style={styles.summaryRate}>
                            Taux actuel : {((info?.cashbackRate ?? 0.05) * 100).toFixed(0)} centimes / 100 pts
                        </Text>
                        <Text style={styles.summaryMax}>
                            Valeur max : {(info?.cashbackValue ?? 0).toFixed(2)} €
                        </Text>
                    </View>

                    <View style={styles.progressSection}>
                        <ProgressBar progress={info?.progression ?? 0} />
                        <Text style={styles.progressLabel}>
                            Prochain palier : {info?.nextPalier ?? 100} pts
                        </Text>
                    </View>
                </View>

                {/* Formulaire */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Convertir en crédit déchèterie</Text>

                    {/* Points à utiliser */}
                    <Text style={styles.label}>Nombre de points à utiliser</Text>
                    <TextInput
                        style={styles.input}
                        value={pointsToUse}
                        onChangeText={setPointsToUse}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={COLORS.muted}
                    />
                    <Text style={styles.hint}>
                        Soit environ <Text style={styles.hintBold}>{eurosValue.toFixed(2)} €</Text> pour votre prochaine collecte
                    </Text>

                    {/* Compte déchèterie */}
                    <Text style={[styles.label, { marginTop: 20 }]}>
                        Numéro de compte déchèterie
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={decheterieAccount}
                        onChangeText={setDecheterieAccount}
                        placeholder="Ex : AAMI-00012345"
                        placeholderTextColor={COLORS.muted}
                        autoCapitalize="characters"
                    />
                    <Text style={styles.hint}>
                        Récupérez ce numéro sur votre carte d'accès déchèterie
                    </Text>

                    {/* Mémoriser */}
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>
                            Mémoriser ce compte pour la prochaine fois
                        </Text>
                        <Switch
                            value={saveAccount}
                            onValueChange={setSaveAccount}
                            trackColor={{ false: COLORS.border, true: COLORS.greenLight }}
                            thumbColor={saveAccount ? COLORS.green : "#f4f3f4"}
                        />
                    </View>

                    {/* Bouton */}
                    <Pressable
                        style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                        onPress={onSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>
                                Utiliser mes points
                            </Text>
                        )}
                    </Pressable>
                </View>

                {/* Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>💡 Comment ça marche ?</Text>
                    <Text style={styles.infoText}>
                        Vos points Tri'n Go sont convertis en crédit sur votre compte déchèterie.
                        Ce crédit sera automatiquement déduit lors de votre prochaine visite.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg },
    container: { padding: 16, gap: 14, paddingBottom: 30 },
    center: { alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 10, color: COLORS.muted },

    pageTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.title,
    },

    // Summary card
    summaryCard: {
        backgroundColor: COLORS.green,
        borderRadius: 18,
        padding: 18,
    },
    summaryLabel: {
        color: "rgba(255,255,255,0.8)",
        fontWeight: "700",
        fontSize: 13,
    },
    summaryValue: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "900",
        marginTop: 4,
    },
    summaryMeta: {
        marginTop: 12,
        gap: 4,
    },
    summaryRate: {
        color: "rgba(255,255,255,0.85)",
        fontWeight: "600",
        fontSize: 13,
    },
    summaryMax: {
        color: "rgba(255,255,255,0.85)",
        fontWeight: "600",
        fontSize: 13,
    },
    progressSection: { marginTop: 14 },
    progressBg: {
        height: 6,
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: 999,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: 999,
    },
    progressLabel: {
        marginTop: 6,
        color: "rgba(255,255,255,0.85)",
        fontSize: 12,
        fontWeight: "600",
    },

    // Form card
    formCard: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 16,
    },

    label: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.title,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: COLORS.text,
    },
    hint: {
        marginTop: 6,
        fontSize: 12,
        color: COLORS.muted,
    },
    hintBold: {
        fontWeight: "800",
        color: COLORS.green,
    },

    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        paddingVertical: 8,
    },
    switchLabel: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        fontWeight: "600",
        marginRight: 10,
    },

    submitBtn: {
        marginTop: 20,
        backgroundColor: COLORS.green,
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: "center",
        shadowColor: COLORS.green,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    submitBtnText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
    },

    // Info card
    infoCard: {
        backgroundColor: "rgba(6,102,140,0.08)",
        borderRadius: 14,
        padding: 14,
    },
    infoTitle: {
        fontWeight: "800",
        color: COLORS.blue,
        marginBottom: 6,
    },
    infoText: {
        color: COLORS.text,
        lineHeight: 20,
        fontSize: 13,
    },

    // Error
    errorText: {
        color: COLORS.danger,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 12,
    },
    retryBtn: {
        backgroundColor: COLORS.blue,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 999,
    },
    retryBtnText: {
        color: "#fff",
        fontWeight: "800",
    },

    // Success
    successCard: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    successIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 24,
    },
    successDetails: {
        width: "100%",
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    successRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    successLabel: {
        color: COLORS.muted,
        fontWeight: "600",
    },
    successValue: {
        color: COLORS.title,
        fontWeight: "800",
    },
    successValueGreen: {
        color: COLORS.green,
        fontWeight: "900",
        fontSize: 16,
    },
    successBtn: {
        marginTop: 24,
        backgroundColor: COLORS.blue,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 999,
    },
    successBtnText: {
        color: "#fff",
        fontWeight: "900",
    },
});