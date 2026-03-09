import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const mapStyles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    // Header
    header: {
        padding: 14,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        flexDirection: "row",
        alignItems: "center",
    },
    headerCol: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.title,
    },
    subtitle: {
        marginTop: 2,
        color: COLORS.muted,
        fontWeight: "600",
        fontSize: 13,
    },

    // Toggle button (pour validés)
    toggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    toggleBtnActive: {
        backgroundColor: COLORS.green,
        borderColor: COLORS.green,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.muted,
    },
    toggleTextActive: {
        color: "#fff",
    },

    // Filtre par ville
    villeFilterContainer: {
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    villeFilters: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 6,
        flexDirection: "row",
    },
    villeChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    villeChipActive: {
        backgroundColor: COLORS.green,
        borderColor: COLORS.green,
    },
    villeChipText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.muted,
    },
    villeChipTextActive: {
        color: "#fff",
    },

    // Filtres par statut
    filtersContainer: {
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    filters: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        flexDirection: "row",
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 6,
    },
    filterChipActive: {
        backgroundColor: COLORS.title,
        borderColor: COLORS.title,
    },
    filterDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
    },
    filterText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.muted,
    },
    filterTextActive: {
        color: "#fff",
    },

    // Map
    map: {
        flex: 1,
    },

    // Loading / Error
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: COLORS.bg,
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.muted,
        fontWeight: "600",
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.danger,
        marginBottom: 8,
    },
    error: {
        color: COLORS.danger,
        fontWeight: "600",
        textAlign: "center",
    },
    retryBtn: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: COLORS.blue,
        borderRadius: 999,
    },
    retryText: {
        color: "#fff",
        fontWeight: "800",
    },

    // Custom Marker
    markerContainer: {
        alignItems: "center",
    },
    markerFocused: {
        transform: [{ scale: 1.2 }],
    },
    markerPin: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        overflow: "hidden",
    },
    markerImage: {
        width: 38,
        height: 38,
        borderRadius: 19,
    },
    markerIcon: {
        fontSize: 20,
    },
    markerArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 10,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        marginTop: -2,
    },

    // Callout (bulle info)
    calloutWrapper: {
        width: 220,
    },
    callout: {
        width: 200,
        padding: 6,
    },
    calloutImage: {
        width: "100%",
        height: 100,
        borderRadius: 8,
        marginBottom: 8,
    },
    calloutTitle: {
        fontWeight: "900",
        color: COLORS.title,
        fontSize: 14,
        marginBottom: 6,
    },
    calloutBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        marginBottom: 6,
    },
    calloutStatus: {
        fontWeight: "800",
        fontSize: 11,
        textTransform: "uppercase",
    },
    calloutDesc: {
        color: COLORS.text,
        fontSize: 12,
        marginBottom: 6,
        lineHeight: 16,
    },
    calloutAddr: {
        color: COLORS.muted,
        fontSize: 11,
        marginBottom: 4,
    },
    calloutCitoyen: {
        color: COLORS.blue,
        fontSize: 11,
        fontWeight: "600",
        marginBottom: 6,
    },
    calloutHint: {
        color: COLORS.blue,
        fontSize: 10,
        fontWeight: "700",
    },

    // Légende
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        flexWrap: "wrap",
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
    },
    legendText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.muted,
    },
});