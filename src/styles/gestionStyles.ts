import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const gestionStyles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    container: {
        padding: 16,
        gap: 12,
        paddingBottom: 30,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    // Filters card
    filtersCard: {
        backgroundColor: COLORS.card,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },

    // Chips (statut)
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: COLORS.bg,
        marginRight: 8,
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

    // Chips small (ville)
    chipSmall: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: COLORS.bg,
        marginRight: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipSmallActive: {
        backgroundColor: COLORS.green,
        borderColor: COLORS.green,
    },
    chipSmallText: {
        fontWeight: "600",
        color: COLORS.muted,
        fontSize: 12,
    },
    chipSmallTextActive: {
        color: "#fff",
    },

    // Error card
    errorCard: {
        backgroundColor: "rgba(176,0,32,0.1)",
        padding: 12,
        borderRadius: 12,
    },
    errorText: {
        color: COLORS.danger,
        fontWeight: "700",
    },

    // Count text
    countText: {
        color: COLORS.muted,
        fontWeight: "700",
    },

    // Empty state
    emptyCard: {
        backgroundColor: COLORS.card,
        padding: 24,
        borderRadius: 14,
        alignItems: "center",
    },
    emptyText: {
        color: COLORS.muted,
    },

    // Card signalement
    card: {
        backgroundColor: COLORS.card,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    cardImage: {
        width: "100%",
        height: 160,
        borderRadius: 10,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    cardType: {
        fontWeight: "900",
        color: COLORS.title,
        fontSize: 15,
    },
    cardDate: {
        color: COLORS.muted,
        fontSize: 12,
        marginTop: 2,
    },
    cardDesc: {
        marginTop: 8,
        color: COLORS.text,
        lineHeight: 18,
    },

    // Address row
    addrRow: {
        marginTop: 8,
        backgroundColor: COLORS.bg,
        padding: 10,
        borderRadius: 10,
    },
    cardAddr: {
        color: COLORS.muted,
        fontSize: 13,
    },
    mapLink: {
        color: COLORS.blue,
        fontSize: 12,
        fontWeight: "700",
        marginTop: 4,
    },

    // Citoyen row
    citoyenRow: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.bg,
        padding: 10,
        borderRadius: 10,
    },
    citoyenName: {
        fontWeight: "700",
        color: COLORS.title,
    },
    citoyenPoints: {
        fontWeight: "800",
        color: COLORS.green,
    },

    // Points badge
    pointsBadge: {
        marginTop: 8,
        backgroundColor: "rgba(112,190,85,0.12)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    pointsText: {
        color: COLORS.green,
        fontWeight: "800",
        fontSize: 12,
    },

    // Status badge
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

    // Actions row
    actionsRow: {
        marginTop: 12,
        flexDirection: "row",
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        backgroundColor: COLORS.blue,
        paddingVertical: 10,
        borderRadius: 999,
        alignItems: "center",
    },
    actionBtnText: {
        color: "#fff",
        fontWeight: "800",
    },
    mapBtn: {
        backgroundColor: COLORS.bg,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    mapBtnText: {
        fontSize: 16,
    },

    // Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 20,
        width: "85%",
        maxWidth: 340,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 4,
    },
    modalSubtitle: {
        color: COLORS.muted,
        marginBottom: 16,
    },
    statusOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    currentLabel: {
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: "600",
    },
    modalCancel: {
        marginTop: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    modalCancelText: {
        color: COLORS.muted,
        fontWeight: "700",
    },
});