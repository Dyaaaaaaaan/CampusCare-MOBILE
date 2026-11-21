import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "CampusCare", headerShown: true }}
      />
      <Stack.Screen name="weather" options={{ title: "Cuaca Area Kampus" }} />
      <Stack.Screen name="explore" options={{ title: "Informasi CampusCare" }} />
      <Stack.Screen name="detail" options={{ title: "Detail Laporan" }} />
      <Stack.Screen name="create-report" options={{ title: "Buat Laporan" }} />
      <Stack.Screen name="vault" options={{ title: "Encrypted Vault" }} />
    </Stack>
  );
}
