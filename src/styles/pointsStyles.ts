import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const pointsStyles = StyleSheet.create({
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

    pageTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.title,
    },

    // Summary card (vert)
    summaryCard: {
        backgroundColor: COLORS.green,
        borderRadius: 18,
        padding: 18,
    },
    summaryLabel: {
        color: "rgba(255,255,255,0.8)",
        fontWeight: "700",
        fontSize: 13,
    },
    summaryValue: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "900",
        marginTop: 4,
    },
    summaryMeta: {
        marginTop: 12,
        gap: 4,
    },
    summaryRate: {
        color: "rgba(255,255,255,0.85)",
        fontWeight: "600",
        fontSize: 13,
    },
    summaryMax: {
        color: "rgba(255,255,255,0.85)",
        fontWeight: "600",
        fontSize: 13,
    },

    // Progress
    progressSection: {
        marginTop: 14,
    },
    progressBg: {
        height: 6,
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: 999,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: 999,
    },
    progressLabel: {
        marginTop: 6,
        color: "rgba(255,255,255,0.85)",
        fontSize: 12,
        fontWeight: "600",
    },

    // Form card
    formCard: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 16,
    },

    label: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.title,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: COLORS.text,
    },
    hint: {
        marginTop: 6,
        fontSize: 12,
        color: COLORS.muted,
    },
    hintBold: {
        fontWeight: "800",
        color: COLORS.green,
    },

    // Switch row
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        paddingVertical: 8,
    },
    switchLabel: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        fontWeight: "600",
        marginRight: 10,
    },

    // Submit button
    submitBtn: {
        marginTop: 20,
        backgroundColor: COLORS.green,
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: "center",
        shadowColor: COLORS.green,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    submitBtnText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
    },

    // Info card
    infoCard: {
        backgroundColor: "rgba(6,102,140,0.08)",
        borderRadius: 14,
        padding: 14,
    },
    infoTitle: {
        fontWeight: "800",
        color: COLORS.blue,
        marginBottom: 6,
    },
    infoText: {
        color: COLORS.text,
        lineHeight: 20,
        fontSize: 13,
    },

    // Error
    errorText: {
        color: COLORS.danger,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 12,
    },
    retryBtn: {
        backgroundColor: COLORS.blue,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 999,
    },
    retryBtnText: {
        color: "#fff",
        fontWeight: "800",
    },

    // Success screen
    successCard: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    successIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 24,
    },
    successDetails: {
        width: "100%",
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    successRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    successLabel: {
        color: COLORS.muted,
        fontWeight: "600",
    },
    successValue: {
        color: COLORS.title,
        fontWeight: "800",
    },
    successValueGreen: {
        color: COLORS.green,
        fontWeight: "900",
        fontSize: 16,
    },
    successBtn: {
        marginTop: 24,
        backgroundColor: COLORS.blue,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 999,
    },
    successBtnText: {
        color: "#fff",
        fontWeight: "900",
    },
});