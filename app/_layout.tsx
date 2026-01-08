// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* laisse Expo Router gérer les groupes */}
        </Stack>
    );
}
