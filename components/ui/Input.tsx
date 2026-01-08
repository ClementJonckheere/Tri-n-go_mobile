import React from "react";
import { TextInput, StyleSheet } from "react-native";
import { theme } from "./theme";

export function Input(props: any) {
    return (
        <TextInput
            {...props}
            placeholderTextColor="#9AA5B1"
            style={[styles.input, props.style]}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: "#F8FAFD",
        borderRadius: theme.radius.input,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        marginBottom: 14,
        color: theme.colors.text,
    },
});
