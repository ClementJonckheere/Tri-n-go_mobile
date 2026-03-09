import { StyleSheet } from "react-native";
import { COLORS } from "./colors";
export const usersStyles = StyleSheet.create({
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

    statsRow: {
        flexDirection: "row",
        gap: 8,
    },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.card,
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "900",
        color: COLORS.title,
    },
    statLabel: {
        color: COLORS.muted,
        fontSize: 11,
        marginTop: 2,
    },

    // Search row
    searchRow: {
        flexDirection: "row",
        gap: 8,
    },
    searchInput: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchBtn: {
        backgroundColor: COLORS.blue,
        width: 44,
        height: 44,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },

    // Chips (filtres)
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: COLORS.card,
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

    // Count text
    countText: {
        color: COLORS.muted,
        fontWeight: "700",
    },

    // Card utilisateur
    card: {
        backgroundColor: COLORS.card,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatarSmall: {
        width: 40,
        height: 40,
        borderRadius: 999,
        backgroundColor: COLORS.blue,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarSmallText: {
        color: "#fff",
        fontWeight: "900",
    },
    userName: {
        fontWeight: "900",
        color: COLORS.title,
    },
    userEmail: {
        color: COLORS.muted,
        fontSize: 12,
    },

    // Role badge
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    roleBadgeText: {
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
    },

    // Card meta
    cardMeta: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    metaText: {
        color: COLORS.muted,
        fontSize: 13,
    },

    // Card actions
    cardActions: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    actionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
    },
});