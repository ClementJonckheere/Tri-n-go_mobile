import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "./theme";

export function Card({ children }: { children: React.ReactNode }) {
    return <View style={[styles.card, theme.shadow.card]}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.card,
        padding: 20,
    },
});
