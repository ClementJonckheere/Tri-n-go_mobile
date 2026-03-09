// app/(tabs)/new-signalement.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
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
import { COLORS } from "../../src/styles";
import { formStyles as styles } from "../../src/styles/formStyles";

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