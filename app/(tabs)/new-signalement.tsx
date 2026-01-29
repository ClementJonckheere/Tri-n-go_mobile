// app/(tabs)/new-signalement.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

import { createSignalement } from "../../src/api/client";
import { TYPE_ENCOMBRANT_LABELS, type TypeEncombrant } from "../../src/types/signalement";

const COLORS = {
    bg: "#F5F7FA",
    card: "#FFFFFF",
    title: "#022B3A",
    text: "#111827",
    muted: "#6b7785",
    border: "#E5E7EB",
    blue: "#06668C",
    green: "#70be55",
    danger: "#B00020",
    inputBg: "#F8FAFD",
};

const TYPES: TypeEncombrant[] = [
    "meuble",
    "electromenager",
    "dechets_verts",
    "plastiques",
    "bois",
    "verre",
];

export default function NewSignalementScreen() {
    const router = useRouter();

    // Formulaire
    const [photo, setPhoto] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [typeEncombrant, setTypeEncombrant] = useState<TypeEncombrant>("meuble");
    const [adresse, setAdresse] = useState("");
    const [ville, setVille] = useState("");
    const [codePostal, setCodePostal] = useState("");

    // Géolocalisation
    const [lat, setLat] = useState<number | null>(null);
    const [lon, setLon] = useState<number | null>(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState("");

    // Soumission
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Récupérer la position GPS au chargement
    useEffect(() => {
        (async () => {
            setGeoLoading(true);
            setGeoError("");

            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setGeoError("Permission de localisation refusée");
                    return;
                }

                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

                setLat(loc.coords.latitude);
                setLon(loc.coords.longitude);

                // Reverse geocoding pour pré-remplir l'adresse
                const [address] = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });

                if (address) {
                    const street = [address.streetNumber, address.street]
                        .filter(Boolean)
                        .join(" ");
                    if (street) setAdresse(street);
                    if (address.city) setVille(address.city);
                    if (address.postalCode) setCodePostal(address.postalCode);
                }
            } catch (e) {
                setGeoError("Impossible de récupérer votre position");
            } finally {
                setGeoLoading(false);
            }
        })();
    }, []);

    // Prendre une photo
    async function pickImage() {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission refusée", "L'accès à la caméra est nécessaire.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.6,
                base64: true,
            });

            if (!result.canceled && result.assets[0]?.base64) {
                setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
        } catch (e) {
            Alert.alert("Erreur", "Impossible de prendre la photo");
        }
    }

    // Choisir depuis la galerie
    async function pickFromGallery() {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission refusée", "L'accès à la galerie est nécessaire.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 0.6,
                base64: true,
            });

            if (!result.canceled && result.assets[0]?.base64) {
                setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
        } catch (e) {
            Alert.alert("Erreur", "Impossible de choisir l'image");
        }
    }

    // Validation
    function validate(): string | null {
        if (!description.trim()) return "Description obligatoire";
        if (!adresse.trim()) return "Adresse obligatoire";
        if (!ville.trim()) return "Ville obligatoire";
        if (!codePostal.trim()) return "Code postal obligatoire";
        if (!/^\d{5}$/.test(codePostal.trim())) return "Code postal invalide (5 chiffres)";
        return null;
    }

    // Soumission
    async function submit() {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setLoading(true);

        try {
            await createSignalement({
                description: description.trim(),
                typeEncombrant,
                adresse: adresse.trim(),
                ville: ville.trim(),
                codePostal: codePostal.trim(),
                lat,
                lon,
                photo,
            });

            Alert.alert(
                "Signalement envoyé ✅",
                "Merci pour votre contribution !",
                [{ text: "OK", onPress: () => router.replace("/(tabs)") }]
            );
        } catch (e: any) {
            setError(e?.message || "Erreur lors de l'envoi");
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
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>Nouveau signalement</Text>

                {/* Photo */}
                <View style={styles.card}>
                    <Text style={styles.label}>Photo de l'encombrant</Text>

                    <View style={styles.photoButtons}>
                        <Pressable style={styles.photoBtn} onPress={pickImage}>
                            <Text style={styles.photoBtnText}>📸 Caméra</Text>
                        </Pressable>
                        <Pressable style={[styles.photoBtn, styles.photoBtnSecondary]} onPress={pickFromGallery}>
                            <Text style={[styles.photoBtnText, { color: COLORS.blue }]}>🖼️ Galerie</Text>
                        </Pressable>
                    </View>

                    {photo && (
                        <View style={styles.previewWrap}>
                            <Image source={{ uri: photo }} style={styles.preview} />
                            <Pressable style={styles.removeBtn} onPress={() => setPhoto(null)}>
                                <Text style={styles.removeBtnText}>✕ Retirer</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                {/* Type d'encombrant */}
                <View style={styles.card}>
                    <Text style={styles.label}>Type d'encombrant</Text>
                    <View style={styles.pickerWrap}>
                        <Picker
                            selectedValue={typeEncombrant}
                            onValueChange={(v) => setTypeEncombrant(v)}
                            style={styles.picker}
                        >
                            {TYPES.map((t) => (
                                <Picker.Item key={t} label={TYPE_ENCOMBRANT_LABELS[t]} value={t} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.card}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Décrivez l'encombrant (état, quantité...)"
                        placeholderTextColor={COLORS.muted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Localisation */}
                <View style={styles.card}>
                    <Text style={styles.label}>Localisation</Text>

                    {geoLoading && (
                        <View style={styles.geoStatus}>
                            <ActivityIndicator size="small" />
                            <Text style={styles.geoText}>Récupération de votre position…</Text>
                        </View>
                    )}

                    {!!geoError && (
                        <Text style={styles.geoError}>{geoError}</Text>
                    )}

                    {lat && lon && (
                        <Text style={styles.geoOk}>📍 Position GPS récupérée</Text>
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder="Adresse / emplacement"
                        placeholderTextColor={COLORS.muted}
                        value={adresse}
                        onChangeText={setAdresse}
                    />

                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.inputHalf]}
                            placeholder="Ville"
                            placeholderTextColor={COLORS.muted}
                            value={ville}
                            onChangeText={setVille}
                        />
                        <TextInput
                            style={[styles.input, styles.inputHalf]}
                            placeholder="Code postal"
                            placeholderTextColor={COLORS.muted}
                            value={codePostal}
                            onChangeText={setCodePostal}
                            keyboardType="number-pad"
                            maxLength={5}
                        />
                    </View>
                </View>

                {/* Erreur */}
                {!!error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Bouton */}
                <Pressable
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={submit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>Envoyer le signalement</Text>
                    )}
                </Pressable>

                {/* Annuler */}
                <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
                    <Text style={styles.cancelBtnText}>Annuler</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.bg },
    container: { padding: 16, gap: 14, paddingBottom: 40 },

    title: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 4,
    },

    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    label: {
        fontSize: 14,
        fontWeight: "800",
        color: COLORS.title,
        marginBottom: 10,
    },

    // Photo
    photoButtons: {
        flexDirection: "row",
        gap: 10,
    },
    photoBtn: {
        flex: 1,
        padding: 14,
        backgroundColor: COLORS.blue,
        borderRadius: 12,
        alignItems: "center",
    },
    photoBtnSecondary: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    photoBtnText: { color: "#fff", fontWeight: "800" },

    previewWrap: { marginTop: 12 },
    preview: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        backgroundColor: COLORS.border,
    },
    removeBtn: {
        marginTop: 8,
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "rgba(176,0,32,0.1)",
        borderRadius: 999,
    },
    removeBtnText: { color: COLORS.danger, fontWeight: "700", fontSize: 13 },

    // Picker
    pickerWrap: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        backgroundColor: COLORS.inputBg,
        overflow: "hidden",
    },
    picker: {
        height: 50,
    },

    // Inputs
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 10,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },

    row: {
        flexDirection: "row",
        gap: 10,
    },
    inputHalf: {
        flex: 1,
    },

    // Géoloc status
    geoStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },
    geoText: { color: COLORS.muted, fontWeight: "600" },
    geoError: { color: COLORS.danger, fontWeight: "600", marginBottom: 10 },
    geoOk: { color: COLORS.green, fontWeight: "700", marginBottom: 10 },

    // Erreur
    errorBox: {
        backgroundColor: "rgba(176,0,32,0.1)",
        padding: 12,
        borderRadius: 12,
    },
    errorText: { color: COLORS.danger, fontWeight: "700" },

    // Boutons
    submitBtn: {
        backgroundColor: COLORS.green,
        padding: 16,
        borderRadius: 999,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    submitBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },

    cancelBtn: {
        padding: 14,
        borderRadius: 999,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#fff",
    },
    cancelBtnText: { color: COLORS.muted, fontWeight: "800" },
});
