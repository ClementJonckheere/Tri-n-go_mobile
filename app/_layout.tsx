// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  // Initialiser les notifications push

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(tabs-agent)" />
    </Stack>
  );
}
