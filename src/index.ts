// src/styles/index.ts
// Point d'entrée pour tous les styles

// Couleurs
export { COLORS } from "./colors";
export type { ColorKey, ColorValue } from "./colors";

// Styles communs
export { commonStyles } from "./common";

// Styles par page
export { authStyles } from "./authStyles";
export { homeStyles } from "./homeStyles";

// Helper pour les couleurs de statut
export function getStatusColor(statut?: string): string {
    switch (statut?.toLowerCase()) {
        case "valide":
            return "#70be55"; // green
        case "en_cours":
            return "#7C3AED"; // purple
        case "collecte":
            return "#06668C"; // blue
        case "refuse":
            return "#B00020"; // danger
        default:
            return "#F59E0B"; // orange (signalé)
    }
}

// Helper pour les backgrounds de badges de statut
export function getStatusBgColor(statut?: string): string {
    switch (statut?.toLowerCase()) {
        case "valide":
            return "rgba(112,190,85,0.15)";
        case "en_cours":
            return "rgba(124,58,237,0.12)";
        case "collecte":
            return "rgba(6,102,140,0.12)";
        case "refuse":
            return "rgba(176,0,32,0.12)";
        default:
            return "rgba(245,158,11,0.15)";
    }
}

// Helper pour les couleurs de rôle
export function getRoleColor(role?: string): string {
    switch (role?.toLowerCase()) {
        case "citoyen":
            return "#70be55"; // green
        case "agent":
            return "#06668C"; // blue
        case "chef_agent":
            return "#F59E0B"; // orange
        case "gestionnaire":
            return "#7C3AED"; // purple
        default:
            return "#6b7785"; // muted
    }
}