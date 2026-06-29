// app/(tabs-agent)/profile-agent.tsx
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { logout, me, updateProfilePicture } from "../../src/api/client";
import { COLORS } from "../../src/styles";
import { profileStyles as styles } from "../../src/styles/profileStyles";
import type { User } from "../../src/types/user";
import { ROLE_LABELS } from "../../src/types/user";

export default function ProfileAgentScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const userData = await me();
      setUser(userData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Nous avons besoin d'accéder à vos photos.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      uploadPhoto(asset.base64!, asset.mimeType || "image/jpeg");
    }
  }

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Nous avons besoin d'accéder à la caméra.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      uploadPhoto(asset.base64!, asset.mimeType || "image/jpeg");
    }
  }

  async function uploadPhoto(base64: string, mimeType: string) {
    setUploadingPhoto(true);
    setError("");
    setSuccess("");

    try {
      const photoData = `data:${mimeType};base64,${base64}`;
      const updated = await updateProfilePicture(photoData);
      setUser(updated);
      setSuccess("Photo mise à jour !");
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l'upload");
    } finally {
      setUploadingPhoto(false);
    }
  }

  function showImageOptions() {
    Alert.alert("Photo de profil", "Comment voulez-vous ajouter une photo ?", [
      { text: "Annuler", style: "cancel" },
      { text: "📷 Prendre une photo", onPress: handleTakePhoto },
      { text: "🖼️ Choisir une image", onPress: handlePickImage },
    ]);
  }

  async function handleLogout() {
    Alert.alert("Déconnexion", "Êtes-vous sûr ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.page, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      {/* Messages */}
      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {!!success && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      {/* Header avec avatar modifiable */}
      <View style={styles.headerCard}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={showImageOptions}
          disabled={uploadingPhoto}
        >
          {user?.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            {uploadingPhoto ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.avatarEditIcon}>📷</Text>
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {ROLE_LABELS[user?.role || "agent"]}
          </Text>
        </View>
      </View>

      {/* Informations */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Informations</Text>
        </View>
        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rôle</Text>
            <Text style={styles.infoValue}>
              {ROLE_LABELS[user?.role || "agent"]}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Périmètre</Text>
            <Text style={styles.infoValue}>
              {user?.perimetreVille || "Aucun"}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Équipe assignée (pour les agents) */}
      {user?.role === "agent" && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👥 Mon Équipe</Text>
          </View>
          <View style={styles.infoList}>
            {user?.chefAgent ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Chef d'équipe</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: COLORS.blue, fontWeight: "700" },
                    ]}
                  >
                    {typeof user.chefAgent === "object" && user.chefAgent?.name
                      ? user.chefAgent.name
                      : "—"}
                  </Text>
                </View>
                {typeof user.chefAgent === "object" &&
                  user.chefAgent?.email && (
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.infoLabel}>Contact</Text>
                      <Text style={styles.infoValue}>
                        {user.chefAgent.email}
                      </Text>
                    </View>
                  )}
              </>
            ) : (
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Équipe</Text>
                <Text style={[styles.infoValue, { color: COLORS.muted }]}>
                  Non assigné
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Info chef d'agent (pour les chefs d'agent) */}
      {user?.role === "chef_agent" && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👥 Mon Équipe</Text>
          </View>
          <View style={styles.teamInfo}>
            <Text style={styles.teamLeaderText}>Vous êtes chef d'équipe</Text>
            <Text style={styles.teamZoneText}>
              Zone : {user?.perimetreVille || "Non définie"}
            </Text>
          </View>
        </View>
      )}

      {/* Déconnexion */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Se déconnecter</Text>
      </Pressable>

      {/* Version */}
      <Text style={styles.version}>Tri'n Go Pro v1.0.0</Text>
    </ScrollView>
  );
}
