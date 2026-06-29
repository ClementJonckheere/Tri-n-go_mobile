// app/(tabs-agent)/user-create.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { createUser } from "../../src/api/gestionClient";
import { COLORS } from "../../src/styles";
import { ROLE_LABELS } from "../../src/types/user";

const ROLES = [
  { value: "citoyen", label: "Citoyen", icon: "👤", color: COLORS.green },
  { value: "agent", label: "Agent", icon: "🛠️", color: COLORS.blue },
  {
    value: "chef_agent",
    label: "Chef d'agent",
    icon: "👷",
    color: COLORS.orange,
  },
  {
    value: "gestionnaire",
    label: "Gestionnaire",
    icon: "👔",
    color: "#8B5CF6",
  },
];

const VILLES = [
  "Amiens",
  "Paris",
  "Lyon",
  "Marseille",
  "Lille",
  "Toulouse",
  "Bordeaux",
  "Nantes",
];

export default function UserCreateScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Formulaire
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("agent");
  const [perimetreVille, setPerimetreVille] = useState("");
  const [showVilles, setShowVilles] = useState(false);

  async function handleSubmit() {
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }
    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }
    if (!password) {
      setError("Le mot de passe est requis");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if ((role === "agent" || role === "chef_agent") && !perimetreVille) {
      setError("Le périmètre (ville) est requis pour les agents");
      return;
    }

    setLoading(true);

    try {
      await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        perimetreVille: perimetreVille || undefined,
      });

      Alert.alert(
        "✅ Utilisateur créé",
        `${name} a été créé avec le rôle ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]}`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  const needsPerimetre = role === "agent" || role === "chef_agent";

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </Pressable>
          <Text style={styles.title}>Créer un utilisateur</Text>
        </View>

        {/* Erreur */}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Formulaire */}
        <View style={styles.card}>
          {/* Nom */}
          <Text style={styles.label}>Nom complet *</Text>
          <TextInput
            style={styles.input}
            placeholder="Jean Dupont"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Email */}
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="jean.dupont@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Mot de passe */}
          <Text style={styles.label}>Mot de passe *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Confirmer mot de passe */}
          <Text style={styles.label}>Confirmer le mot de passe *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Sélection du rôle */}
        <View style={styles.card}>
          <Text style={styles.label}>Rôle *</Text>
          <View style={styles.rolesGrid}>
            {ROLES.map((r) => (
              <Pressable
                key={r.value}
                style={[
                  styles.roleOption,
                  role === r.value && {
                    borderColor: r.color,
                    backgroundColor: `${r.color}15`,
                  },
                ]}
                onPress={() => setRole(r.value)}
              >
                <Text style={styles.roleIcon}>{r.icon}</Text>
                <Text
                  style={[
                    styles.roleLabel,
                    role === r.value && { color: r.color, fontWeight: "800" },
                  ]}
                >
                  {r.label}
                </Text>
                {role === r.value && (
                  <View
                    style={[styles.roleCheck, { backgroundColor: r.color }]}
                  >
                    <Text style={styles.roleCheckText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Périmètre (si agent ou chef_agent) */}
        {needsPerimetre && (
          <View style={styles.card}>
            <Text style={styles.label}>Périmètre (ville) *</Text>
            <Pressable
              style={styles.selectInput}
              onPress={() => setShowVilles(!showVilles)}
            >
              <Text
                style={[
                  styles.selectText,
                  !perimetreVille && { color: COLORS.muted },
                ]}
              >
                {perimetreVille || "Sélectionner une ville..."}
              </Text>
              <Text style={styles.selectArrow}>{showVilles ? "▲" : "▼"}</Text>
            </Pressable>

            {showVilles && (
              <View style={styles.villesList}>
                {VILLES.map((v) => (
                  <Pressable
                    key={v}
                    style={[
                      styles.villeOption,
                      perimetreVille === v && styles.villeOptionActive,
                    ]}
                    onPress={() => {
                      setPerimetreVille(v);
                      setShowVilles(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.villeOptionText,
                        perimetreVille === v && styles.villeOptionTextActive,
                      ]}
                    >
                      {v}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Text style={styles.helpText}>
              L'agent ne verra que les signalements de cette ville
            </Text>
          </View>
        )}

        {/* Bouton créer */}
        <Pressable
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Créer l'utilisateur</Text>
          )}
        </Pressable>

        {/* Info */}
        <Text style={styles.infoText}>
          L'utilisateur pourra se connecter avec son email et mot de passe.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    marginBottom: 10,
  },
  backBtnText: {
    color: COLORS.blue,
    fontWeight: "700",
    fontSize: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2937",
  },
  errorBox: {
    backgroundColor: "rgba(176,0,32,0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  rolesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  roleOption: {
    width: "48%",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    position: "relative",
  },
  roleIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  roleCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  roleCheckText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
  },
  selectText: {
    fontSize: 16,
    color: "#1F2937",
  },
  selectArrow: {
    color: "#6B7280",
  },
  villesList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  villeOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  villeOptionActive: {
    backgroundColor: `${COLORS.blue}15`,
  },
  villeOptionText: {
    fontSize: 15,
    color: "#374151",
  },
  villeOptionTextActive: {
    color: COLORS.blue,
    fontWeight: "700",
  },
  helpText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
    fontStyle: "italic",
  },
  submitBtn: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  infoText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 16,
  },
});
