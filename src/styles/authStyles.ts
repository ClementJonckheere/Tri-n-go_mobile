import { StyleSheet, Platform } from "react-native";
import { COLORS } from "./colors";

export const authStyles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingVertical: 32,
        alignItems: "center",
        justifyContent: "center",
    },

    // Card principale
    card: {
        width: "100%",
        maxWidth: 1100,
        backgroundColor: COLORS.white,
        borderRadius: 28,
        overflow: "hidden",
        minHeight: 520,
        shadowColor: COLORS.blue,
        shadowOpacity: 0.15,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 18 },
        elevation: 6,
    },
    cardRow: {
        flexDirection: "row",
    },
    cardCol: {
        flexDirection: "column",
    },

    // Partie gauche (image)
    left: {
        justifyContent: "flex-start",
    },
    leftWide: {
        flexBasis: "42%",
        minHeight: 420,
    },
    leftNarrow: {
        width: "100%",
        height: 180,
    },
    leftImg: {
        resizeMode: "cover",
    },

    // Logo
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

    // Partie droite (formulaire)
    right: {
        flex: 1,
        paddingHorizontal: 22,
        paddingVertical: 26,
        justifyContent: "center",
    },

    // Header
    header: {
        marginBottom: 16,
    },
    eyebrow: {
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: 2.5,
        color: "#427AA1",
        fontWeight: "600",
        marginBottom: 6,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: COLORS.title,
    },
    titleGreen: {
        color: COLORS.green,
    },
    subtitle: {
        marginTop: 8,
        color: COLORS.subtitle,
        fontSize: 14,
        lineHeight: 20,
    },

    // Formulaire
    form: {
        marginTop: 10,
    },
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
    input: {
        fontSize: 14,
        color: "#111827",
    },

    // Ligne avec 2 inputs
    row2: {
        marginTop: 4,
        flexDirection: "row",
        gap: 10,
    },

    // Erreur
    error: {
        marginTop: 12,
        color: COLORS.error,
        fontSize: 13,
        fontWeight: "600",
    },

    // Bouton principal
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
    btnText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 15,
    },


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