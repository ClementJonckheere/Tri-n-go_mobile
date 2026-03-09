import { StyleSheet, Platform } from "react-native";
import { COLORS } from "./colors";

// Styles de base réutilisables
export const commonStyles = StyleSheet.create({
    // Layouts
    page: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    container: {
        padding: 16,
        gap: 14,
        paddingBottom: 30,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    rowBetween: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    // Cards
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "900",
        color: COLORS.title,
    },
    cardLink: {
        color: COLORS.blue,
        fontWeight: "800",
        fontSize: 13,
    },

    // Typography
    pageTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.title,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: COLORS.title,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.title,
        marginBottom: 6,
    },
    text: {
        color: COLORS.text,
        fontSize: 14,
    },
    mutedText: {
        color: COLORS.muted,
        fontSize: 13,
    },
    smallText: {
        color: COLORS.muted,
        fontSize: 12,
    },

    // Loading
    loadingText: {
        marginTop: 10,
        color: COLORS.muted,
        fontWeight: "600",
    },

    // Errors
    errorCard: {
        backgroundColor: "rgba(176,0,32,0.08)",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(176,0,32,0.2)",
    },
    errorText: {
        color: COLORS.danger,
        fontWeight: "700",
    },

    // Success
    successCard: {
        backgroundColor: "rgba(112,190,85,0.15)",
        borderRadius: 14,
        padding: 14,
    },
    successText: {
        color: COLORS.green,
        fontWeight: "700",
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
    },
    inputRound: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBg,
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === "ios" ? 12 : 8,
        fontSize: 14,
        color: COLORS.text,
    },

    // Buttons
    btnPrimary: {
        backgroundColor: COLORS.green,
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    btnPrimaryText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 15,
    },
    btnSecondary: {
        backgroundColor: COLORS.blue,
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    btnSecondaryText: {
        color: "#fff",
        fontWeight: "800",
    },
    btnOutline: {
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    btnOutlineText: {
        color: COLORS.muted,
        fontWeight: "800",
    },
    btnDanger: {
        backgroundColor: COLORS.danger,
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: "center",
    },
    btnDangerText: {
        color: "#fff",
        fontWeight: "800",
    },

    // Chips / Pills
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: {
        backgroundColor: COLORS.blue,
        borderColor: COLORS.blue,
    },
    chipText: {
        fontWeight: "700",
        color: COLORS.muted,
    },
    chipTextActive: {
        color: "#fff",
    },

    // Badges
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
    },

    // Avatars
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 999,
        backgroundColor: COLORS.blue,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
    },
    avatarLarge: {
        width: 72,
        height: 72,
        borderRadius: 999,
        backgroundColor: COLORS.blue,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarLargeText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "900",
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 12,
    },

    // Shadow (iOS)
    shadow: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    shadowLarge: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },
});

// Export raccourcis
export const { page, container, center, card, cardHeader, cardTitle } = commonStyles;