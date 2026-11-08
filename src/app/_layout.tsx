import { ReportProvider } from "@/store/reports-store";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ReportProvider>
        <Stack>
          <Stack.Screen
            name="weather"
            options={{
              title: "Cuaca Area Kampus",
            }}
          />
          <Stack.Screen
            name="index"
            options={{
              title: "CampusCare",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="explore"
            options={{
              title: "Informasi CampusCare",
            }}
          />

          <Stack.Screen
            name="detail"
            options={{
              title: "Detail Laporan",
            }}
          />

          <Stack.Screen
            name="create-report"
            options={{
              title: "Buat Laporan",
            }}
          />
        </Stack>
      </ReportProvider>
    </ThemeProvider>
  );
}
