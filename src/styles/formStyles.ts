import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const formStyles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    container: {
        padding: 16,
        gap: 14,
        paddingBottom: 40,
    },

    title: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.title,
        marginBottom: 4,
    },

    // Card
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    label: {
        fontSize: 14,
        fontWeight: "800",
        color: COLORS.title,
        marginBottom: 10,
    },

    // Photo
    photoButtons: {
        flexDirection: "row",
        gap: 10,
    },
    photoBtn: {
        flex: 1,
        padding: 14,
        backgroundColor: COLORS.blue,
        borderRadius: 12,
        alignItems: "center",
    },
    photoBtnSecondary: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    photoBtnText: {
        color: "#fff",
        fontWeight: "800",
    },

    previewWrap: {
        marginTop: 12,
    },
    preview: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        backgroundColor: COLORS.border,
    },
    removeBtn: {
        marginTop: 8,
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "rgba(176,0,32,0.1)",
        borderRadius: 999,
    },
    removeBtnText: {
        color: COLORS.danger,
        fontWeight: "700",
        fontSize: 13,
    },

    // Picker
    pickerWrap: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        backgroundColor: COLORS.inputBg,
        overflow: "hidden",
    },
    picker: {
        height: 50,
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
        marginBottom: 10,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },

    row: {
        flexDirection: "row",
        gap: 10,
    },
    inputHalf: {
        flex: 1,
    },

    // Géolocalisation status
    geoStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },
    geoText: {
        color: COLORS.muted,
        fontWeight: "600",
    },
    geoError: {
        color: COLORS.danger,
        fontWeight: "600",
        marginBottom: 10,
    },
    geoOk: {
        color: COLORS.green,
        fontWeight: "700",
        marginBottom: 10,
    },

    // Erreur
    errorBox: {
        backgroundColor: "rgba(176,0,32,0.1)",
        padding: 12,
        borderRadius: 12,
    },
    errorText: {
        color: COLORS.danger,
        fontWeight: "700",
    },

    // Boutons
    submitBtn: {
        backgroundColor: COLORS.green,
        padding: 16,
        borderRadius: 999,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    submitBtnText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
    },

    cancelBtn: {
        padding: 14,
        borderRadius: 999,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#fff",
    },
    cancelBtnText: {
        color: COLORS.muted,
        fontWeight: "800",
    },
});