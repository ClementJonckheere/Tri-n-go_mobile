// app/index.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, type Href } from "expo-router";
import { getToken } from "../src/auth/session";

export default function Index() {
    const [target, setTarget] = useState<Href | null>(null);

    useEffect(() => {
        (async () => {
            const token = await getToken();
            setTarget(token ? "/(tabs)" : "/(auth)/login");
        })();
    }, []);

    if (!target) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    return <Redirect href={target} />;
}
