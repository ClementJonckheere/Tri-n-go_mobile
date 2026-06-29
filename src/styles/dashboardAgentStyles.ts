// src/styles/dashboardAgentStyles.ts
// Styles pour le dashboard agent/gestionnaire

import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "./colors";

const { width: screenWidth } = Dimensions.get("window");

export const dashboardAgentStyles = StyleSheet.create({
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
    loadingText: {
        marginTop: 10,
        color: COLORS.muted,
    },

    // Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    hello: {
        fontSize: 20,
        fontWeight: "900",
        color: COLORS.title,
    },
    role: {
        color: COLORS.muted,
        fontWeight: "600",
        marginTop: 2,
    },

    // Logout
    logoutBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(176,0,32,0.1)",
    },
    logoutText: {
        color: COLORS.danger,
        fontWeight: "700",
        fontSize: 13,
    },

    // Error card
    errorCard: {
        backgroundColor: "rgba(176,0,32,0.1)",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    errorText: {
        color: COLORS.danger,
        fontWeight: "700",
    },
    retryBtn: {
        marginTop: 10,
        backgroundColor: COLORS.danger,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },
    retryText: {
        color: "#fff",
        fontWeight: "700",
    },

    // Filter card
    filterCard: {
        backgroundColor: COLORS.card,
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterLabel: {
        fontWeight: "700",
        color: COLORS.muted,
        marginBottom: 8,
        fontSize: 13,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: COLORS.bg,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterChipActive: {
        backgroundColor: COLORS.blue,
        borderColor: COLORS.blue,
    },
    filterChipText: {
        fontWeight: "700",
        color: COLORS.muted,
    },
    filterChipTextActive: {
        color: "#fff",
    },

    // KPI Grid
    kpiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    kpiCard: {
        flex: 1,
        minWidth: (screenWidth - 52) / 2,
        backgroundColor: COLORS.card,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
    },
    kpiIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    kpiValue: {
        fontSize: 28,
        fontWeight: "900",
    },
    kpiLabel: {
        color: COLORS.muted,
        fontWeight: "600",
        marginTop: 4,
        fontSize: 12,
    },

    // Signalements urgents
    urgentCard: {
        backgroundColor: "#FEF2F2",
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    urgentIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    urgentIconText: {
        fontSize: 22,
    },
    urgentInfo: {
        flex: 1,
    },
    urgentTitle: {
        fontWeight: "900",
        color: "#991B1B",
        fontSize: 14,
    },
    urgentSubtitle: {
        color: "#B91C1C",
        fontSize: 12,
        marginTop: 2,
    },
    urgentCount: {
        backgroundColor: "#DC2626",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
    },
    urgentCountText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
    },

    // Card générique
    card: {
        backgroundColor: COLORS.card,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 12,
    },

    // Taux de validation
    tauxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    tauxValue: {
        fontSize: 28,
        fontWeight: "900",
        color: COLORS.green,
        width: 70,
    },
    tauxHint: {
        marginTop: 8,
        color: COLORS.muted,
        fontSize: 12,
    },

    // Progress bar
    progressBg: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 999,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
    },

    // Actions row
    actionsRow: {
        flexDirection: "row",
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    actionIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    actionText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 13,
        textAlign: "center",
    },

    // Type row (répartition)
    typeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 8,
    },
    typeLabel: {
        width: 100,
        fontWeight: "600",
        color: COLORS.text,
        fontSize: 13,
    },
    typeBarWrap: {
        flex: 1,
    },
    typeValue: {
        width: 30,
        textAlign: "right",
        fontWeight: "800",
        color: COLORS.title,
    },

    // Rank row (top citoyens)
    rankRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    rankNum: {
        width: 30,
        fontWeight: "900",
        color: COLORS.orange,
        fontSize: 16,
    },
    rankInfo: {
        flex: 1,
    },
    rankName: {
        fontWeight: "800",
        color: COLORS.title,
    },
    rankMeta: {
        color: COLORS.muted,
        fontSize: 12,
    },
    rankPoints: {
        fontWeight: "900",
        color: COLORS.green,
    },

    // Agent row (activité)
    agentRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    agentRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.blue + "15",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    agentRankText: {
        fontWeight: "900",
        color: COLORS.blue,
        fontSize: 12,
    },
    agentInfo: {
        flex: 1,
    },
    agentName: {
        fontWeight: "800",
        color: COLORS.title,
        fontSize: 14,
    },
    agentEmail: {
        color: COLORS.blue,
        fontSize: 12,
        marginTop: 1,
    },
    agentRole: {
        color: COLORS.muted,
        fontSize: 12,
        marginTop: 2,
    },
    agentStats: {
        alignItems: "flex-end",
    },
    agentCount: {
        fontWeight: "900",
        color: COLORS.blue,
        fontSize: 18,
    },
    agentCountLabel: {
        color: COLORS.muted,
        fontSize: 11,
    },

    // Stats row (temps moyen)
    statsRow: {
        flexDirection: "row",
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.bg,
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    statBoxValue: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.blue,
    },
    statBoxLabel: {
        color: COLORS.muted,
        fontSize: 12,
        marginTop: 4,
    },
});