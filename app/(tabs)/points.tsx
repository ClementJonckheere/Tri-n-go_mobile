// app/(tabs)/points.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
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
import { COLORS } from "../../src/styles";
import { pointsStyles as styles } from "../../src/styles/pointsStyles";

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