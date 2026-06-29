// src/styles/welcomeStyles.ts
import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "./colors";

const { width, height } = Dimensions.get("window");

export const welcomeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    logo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    logoIcon: {
        fontSize: 28,
    },
    logoText: {
        fontSize: 24,
        fontWeight: "800",
        color: COLORS.green,
    },
    headerButtons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    btnContact: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    btnContactText: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.text,
    },
    btnLogin: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: COLORS.green,
    },
    btnLoginText: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.white,
    },

    heroSection: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        alignItems: "center"
    },

    heroImage: {
        maxWidth: width - 0,
        maxHeight: height * 0.4
    },

    heroTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: COLORS.title,
        textAlign: "center",
        marginBottom: 12,
    },
    heroTitleHighlight: {
        color: COLORS.green,
    },
    heroSubtitle: {
        fontSize: 16,
        color: COLORS.muted,
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 16,
    },

    // === CTA BUTTONS ===
    ctaSection: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        gap: 12,
    },
    btnPrimary: {
        backgroundColor: COLORS.green,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: COLORS.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    btnPrimaryText: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.white,
    },
    btnSecondary: {
        backgroundColor: COLORS.white,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    btnSecondaryText: {
        fontSize: 17,
        fontWeight: "600",
        color: COLORS.text,
    },

    featuresSection: {
        paddingHorizontal: 24,
        paddingVertical: 32,
        backgroundColor: COLORS.white,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.title,
        textAlign: "center",
        marginBottom: 24,
    },
    featuresGrid: {
        gap: 16,
    },
    featureCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 16,
        backgroundColor: COLORS.bg,
        padding: 16,
        borderRadius: 12,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center",
    },
    featureIconText: {
        fontSize: 24,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.title,
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 14,
        color: COLORS.muted,
        lineHeight: 20,
    },

    // === STATS SECTION ===
    statsSection: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 32,
        paddingHorizontal: 16,
        backgroundColor: COLORS.green,
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 32,
        fontWeight: "800",
        color: COLORS.white,
    },
    statLabel: {
        fontSize: 13,
        color: "rgba(255,255,255,0.85)",
        marginTop: 4,
    },

    // === FOOTER ===
    footer: {
        paddingVertical: 24,
        paddingHorizontal: 24,
        alignItems: "center",
        backgroundColor: COLORS.bg,
    },
    footerText: {
        fontSize: 13,
        color: COLORS.muted,
    },
    footerLink: {
        color: COLORS.green,
        fontWeight: "600",
    },
});

export const contactStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingbottom: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
    },
    backButtonText: {
        fontSize: 20,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.title,
        textAlign: "center",
        marginRight: 40,
    },

    // Content
    content: {
        flex: 1,
        padding: 24,
    },
    intro: {
        alignItems: "center",
        marginBottom: 32,
    },
    introEmoji: {
        fontSize: 56,
        marginBottom: 16,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: COLORS.title,
        marginBottom: 8,
    },
    introText: {
        fontSize: 15,
        color: COLORS.muted,
        textAlign: "center",
        lineHeight: 22,
    },

    // Form
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.text,
    },
    required: {
        color: COLORS.error,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: COLORS.text,
    },
    inputFocused: {
        borderColor: COLORS.green,
        shadowColor: COLORS.green,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 2,
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    pickerWrapper: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        overflow: "hidden",
    },
    picker: {
        height: 50,
    },

    submitButton: {
        backgroundColor: COLORS.green,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
        shadowColor: COLORS.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.muted,
        shadowOpacity: 0,
    },
    submitButtonText: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.white,
    },

    // Contact cards
    contactCards: {
        marginTop: 32,
        gap: 12,
    },
    contactCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    contactCardIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
    },
    contactCardIconText: {
        fontSize: 22,
    },
    contactCardContent: {
        flex: 1,
    },
    contactCardTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.title,
        marginBottom: 2,
    },
    contactCardValue: {
        fontSize: 14,
        color: COLORS.muted,
    },

    // Success message
    successContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    successEmoji: {
        fontSize: 72,
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: COLORS.title,
        marginBottom: 12,
        textAlign: "center",
    },
    successText: {
        fontSize: 15,
        color: COLORS.muted,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
    },
    successButton: {
        backgroundColor: COLORS.green,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    successButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.white,
    },
});