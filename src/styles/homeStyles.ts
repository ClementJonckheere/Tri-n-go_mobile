// src/styles/homeStyles.ts
// Styles pour la page d'accueil citoyen

import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const homeStyles = StyleSheet.create({
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
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.muted,
        fontWeight: "600",
    },

    // Hero
    hero: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    heroImg: {
        width: 56,
        height: 56,
    },
    heroTextWrap: {
        flex: 1,
    },
    heroHello: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.title,
    },
    heroText: {
        marginTop: 4,
        color: COLORS.muted,
        fontWeight: "600",
        fontSize: 13,
    },

    // Erreur
    errorCard: {
        backgroundColor: "rgba(176,0,32,0.08)",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(176,0,32,0.2)",
    },
    errorTitle: {
        fontWeight: "900",
        color: COLORS.danger,
    },
    errorText: {
        marginTop: 6,
        color: COLORS.danger,
    },
    retryBtn: {
        marginTop: 12,
        backgroundColor: COLORS.danger,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    retryBtnText: {
        color: "#fff",
        fontWeight: "800",
    },

    // Points Card
    pointsCard: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pointsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pointsLabel: {
        color: COLORS.muted,
        fontWeight: "800",
        fontSize: 13,
    },
    pointsLink: {
        color: COLORS.blue,
        fontWeight: "800",
        fontSize: 13,
    },
    pointsValue: {
        marginTop: 8,
        fontSize: 32,
        fontWeight: "900",
        color: COLORS.title,
    },

    // Progression
    progressSection: {
        marginTop: 14,
    },
    progressBg: {
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 999,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: COLORS.green,
        borderRadius: 999,
    },
    progressText: {
        marginTop: 6,
        fontSize: 12,
        color: COLORS.muted,
    },
    bold: {
        fontWeight: "800",
    },

    // Cashback
    cashbackRow: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
    },
    cashbackLabel: {
        color: COLORS.muted,
        fontWeight: "600",
        fontSize: 13,
    },
    cashbackValue: {
        color: COLORS.green,
        fontWeight: "900",
        fontSize: 16,
    },
    cashbackRate: {
        marginTop: 4,
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: "600",
    },

    // CTA
    ctaBtn: {
        backgroundColor: COLORS.green,
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: COLORS.green,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    ctaIcon: {
        fontSize: 28,
    },
    ctaTextWrap: {
        flex: 1,
    },
    ctaTitle: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 15,
    },
    ctaSubtitle: {
        color: "rgba(255,255,255,0.85)",
        fontWeight: "600",
        fontSize: 12,
        marginTop: 2,
    },
    ctaArrow: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "900",
    },

    // Card générique
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

    // Signalements
    signalRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    signalInfo: {
        flex: 1,
    },
    signalType: {
        color: COLORS.text,
        fontWeight: "800",
    },
    signalAddr: {
        color: COLORS.muted,
        fontSize: 12,
        marginTop: 2,
    },

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

    empty: {
        color: COLORS.muted,
        fontWeight: "600",
        fontStyle: "italic",
    },

    // Éco-gestes
    ecoList: {
        marginTop: 8,
        gap: 6,
    },
    ecoItem: {
        color: COLORS.text,
        fontWeight: "600",
        lineHeight: 20,
    },

    // Bottom actions
    bottomActions: {
        gap: 10,
        marginTop: 6,
    },
    profileBtn: {
        backgroundColor: COLORS.blue,
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: "center",
    },
    profileBtnText: {
        color: "#fff",
        fontWeight: "900",
    },
    logoutBtn: {
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#fff",
    },
    logoutBtnText: {
        color: COLORS.muted,
        fontWeight: "800",
    },

    // Top citoyens / Classement
    rankRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    rankRowHighlight: {
        backgroundColor: COLORS.green + "10",
        marginHorizontal: -14,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    rankNum: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    rankNumText: {
        fontWeight: "900",
        color: COLORS.orange,
        fontSize: 14,
    },
    rankInfo: {
        flex: 1,
    },
    rankName: {
        fontWeight: "800",
        color: COLORS.title,
        fontSize: 14,
    },
    rankNameMe: {
        color: COLORS.green,
    },
    rankMeta: {
        color: COLORS.muted,
        fontSize: 12,
        marginTop: 2,
    },
    rankPoints: {
        fontWeight: "900",
        color: COLORS.title,
        fontSize: 15,
    },
    rankPointsMe: {
        color: COLORS.green,
    },
});