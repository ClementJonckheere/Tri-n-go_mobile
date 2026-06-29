// app/index.tsx
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, type Href } from "expo-router";
import { getToken } from "../src/auth/session";
import { me } from "../src/api/client";
import { COLORS } from "../src/styles/colors";

export default function Index() {
    const [checking, setChecking] = useState(true);
    const [hasToken, setHasToken] = useState(false);
    const [isAgent, setIsAgent] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                if (token) {
                    setHasToken(true);
                    const user = await me();
                    if (["agent", "chef_agent", "gestionnaire"].includes(user.role)) {
                        setIsAgent(true);
                    }
                }
            } catch {
                setHasToken(false);
            } finally {
                setChecking(false);
            }
        })();
    }, []);

    if (checking) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg }}>
                <ActivityIndicator size="large" color={COLORS.green} />
            </View>
        );
    }

    if (!hasToken) return <Redirect href={"/welcome" as Href} />;

    if (isAgent) return <Redirect href={"/(tabs-agent)" as Href} />;
    return <Redirect href={"/(tabs)" as Href} />;
}