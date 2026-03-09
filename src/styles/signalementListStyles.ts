import { StyleSheet } from "react-native";
import { COLORS } from "./colors";
export const signalementListStyles = StyleSheet.create({
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
    loadingText: {
        marginTop: 10,
        color: COLORS.muted,
    },

    pageTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 4,
    },

    // Stats row
    statsRow: {
        flexDirection: "row",
        gap: 8,
    },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.title,
    },
    statLabel: {
        fontSize: 10,
        color: COLORS.muted,
        fontWeight: "700",
        marginTop: 2,
    },

    // Card signalement
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
    },
    cardTitle: {
        flex: 1,
        fontWeight: "900",
        color: COLORS.title,
        fontSize: 15,
    },
    cardDesc: {
        marginTop: 8,
        color: COLORS.text,
        lineHeight: 20,
    },
    cardFooter: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardMeta: {
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: "600",
    },
    cardDate: {
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: "600",
    },

    // Badge statut
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

    // Points badge
    pointsBadge: {
        marginTop: 10,
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

    // Empty state
    emptyCard: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.title,
    },
    emptyText: {
        marginTop: 6,
        color: COLORS.muted,
        textAlign: "center",
    },
    emptyBtn: {
        marginTop: 16,
        backgroundColor: COLORS.green,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 999,
    },
    emptyBtnText: {
        color: "#fff",
        fontWeight: "800",
    },

    // New button
    newBtn: {
        marginTop: 4,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: COLORS.green,
        shadowColor: COLORS.green,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    newBtnText: {
        color: "#fff",
        fontWeight: "900",
    },
});