import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const signalementDetailStyles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    container: {
        paddingBottom: 30,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.muted,
    },

    // Header
    header: {
        padding: 16,
    },
    backLink: {},
    backLinkText: {
        color: COLORS.blue,
        fontWeight: "800",
    },

    // Photo
    photo: {
        width: "100%",
        height: 220,
        backgroundColor: COLORS.border,
    },

    // Card
    card: {
        backgroundColor: COLORS.card,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 10,
    },

    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: "900",
        color: COLORS.title,
    },

    // Status badge
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "900",
        textTransform: "uppercase",
    },

    description: {
        marginTop: 14,
        color: COLORS.text,
        lineHeight: 22,
        fontSize: 15,
    },

    // Meta sections
    metaSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    metaLabel: {
        color: COLORS.muted,
        fontWeight: "700",
        fontSize: 13,
        marginBottom: 6,
    },
    metaValue: {
        color: COLORS.text,
        fontWeight: "600",
        fontSize: 15,
    },

    pointsSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pointsLabel: {
        color: COLORS.muted,
        fontWeight: "700",
    },
    pointsValue: {
        color: COLORS.green,
        fontWeight: "900",
        fontSize: 18,
    },

    // GPS
    gpsText: {
        color: COLORS.muted,
        fontFamily: "monospace",
        fontSize: 13,
    },
    mapBtn: {
        marginTop: 12,
        backgroundColor: COLORS.blue,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    mapBtnText: {
        color: "#fff",
        fontWeight: "800",
    },

    // Erreurs
    errorTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.danger,
        marginBottom: 8,
    },
    errorText: {
        color: COLORS.danger,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 16,
    },
    backBtn: {
        backgroundColor: COLORS.blue,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 999,
    },
    backBtnText: {
        color: "#fff",
        fontWeight: "800",
    },
});