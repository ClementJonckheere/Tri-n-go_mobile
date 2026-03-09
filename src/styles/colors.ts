export const COLORS = {
    // Backgrounds
    bg: "#F5F7FA",
    card: "#FFFFFF",
    inputBg: "#F8FAFD",

    // Text
    title: "#022B3A",
    text: "#111827",
    muted: "#6b7785",
    subtitle: "#4f5b66",
    placeholder: "#9aa5b1",

    // Borders
    border: "#E5E7EB",

    // Primary colors
    blue: "#06668C",
    green: "#70be55",

    // Status colors
    danger: "#B00020",
    error: "#B00020",
    orange: "#F59E0B",
    purple: "#7C3AED",

    // Misc
    white: "#FFFFFF",
} as const;

export type ColorKey = keyof typeof COLORS;
export type ColorValue = typeof COLORS[ColorKey];