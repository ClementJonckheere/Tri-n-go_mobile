import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { theme } from "./theme";

export function PrimaryButton({
                                  title,
                                  onPress,
                                  disabled,
                                  loading,
                              }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={[styles.btn, (disabled || loading) && { opacity: 0.7 }]}
        >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
        </Pressable>
    );
}

export function LinkButton({
                               title,
                               onPress,
                           }: {
    title: string;
    onPress: () => void;
}) {
    return (
        <Pressable onPress={onPress} style={styles.linkWrap}>
            <Text style={styles.linkText}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        borderRadius: theme.radius.button,
        paddingVertical: 14,
        paddingHorizontal: 18,
        backgroundColor: theme.colors.green,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    text: { color: "#fff", fontWeight: "800", fontSize: 15 },
    linkWrap: { alignItems: "center", paddingVertical: 10 },
    linkText: { color: theme.colors.blue, fontWeight: "700" },
});
