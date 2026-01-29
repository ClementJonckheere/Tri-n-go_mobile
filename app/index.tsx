// app/index.tsx
import { Redirect } from "expo-router";
import { getToken } from "../src/auth/session";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const [target, setTarget] = useState<"/(auth)/login" | "/(tabs)">();

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
