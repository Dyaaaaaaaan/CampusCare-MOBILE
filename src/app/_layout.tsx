import { AuthProvider, useAuth } from "@/store/auth-context";
import { ReportProvider } from "@/store/reports-store";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, useColorScheme, View } from "react-native";

// Navigation guard: memeriksa route aktif lewat useSegments()
// lalu mengarahkan user sesuai status autentikasi.
function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // RULE 1: selama sesi masih dipulihkan dari vault, jangan redirect.
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // RULE 2 & 4: belum login / sudah logout -> ke halaman login.
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // RULE 3: sudah login tapi masih di halaman login -> ke aplikasi.
      router.replace("/");
    }
  }, [user, isLoading, segments, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>

      {/* Smooth loading shield: mencegah layout flickering saat startup. */}
      {isLoading ? (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : null}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <ReportProvider>
          <RootNavigator />
        </ReportProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
});
