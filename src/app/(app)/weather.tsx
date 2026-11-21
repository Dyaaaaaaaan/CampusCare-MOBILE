import {
  getWeatherWithPromise
} from "@/services/weatherService";

import { WeatherData } from "@/types/api";

import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function WeatherScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================
  // CUSTOM ASYNC FUNCTION
  // ==================================

  const loadWeather = useCallback(() => {
    setLoading(true);
    setError("");

    getWeatherWithPromise()
      .then((data) => {
        // Jika Promise berhasil
        setWeather(data);
      })
      .catch((err: unknown) => {
        // Jika Promise gagal
        const message =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan yang tidak diketahui";

        setError(message);
      })
      .finally(() => {
        // Selalu dijalankan setelah proses selesai
        setLoading(false);
      });
  }, []);

  // ==================================
  // USE EFFECT
  // ==================================

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  // ==================================
  // KONVERSI KODE CUACA
  // ==================================

  function getWeatherDescription(code: number) {
    if (code === 0) return "Cerah";
    if ([1, 2, 3].includes(code)) return "Berawan";
    if ([45, 48].includes(code)) return "Berkabut";
    if ([51, 53, 55, 56, 57].includes(code)) return "Gerimis";
    if ([61, 63, 65, 66, 67].includes(code)) return "Hujan";
    if ([71, 73, 75, 77].includes(code)) return "Salju";
    if ([80, 81, 82].includes(code)) return "Hujan deras";
    if ([95, 96, 99].includes(code)) return "Badai petir";

    return "Kondisi tidak diketahui";
  }

  // ==================================
  // TAMPILAN APLIKASI
  // ==================================

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>INFORMASI EKSTERNAL</Text>

      <Text style={styles.title}>Cuaca Area Kampus</Text>

      <Text style={styles.subtitle}>Informasi cuaca dari Open-Meteo API</Text>

      {/* KONDISI LOADING */}

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator size="large" color="#2563eb" />

          <Text style={styles.stateText}>Mengambil data cuaca...</Text>
        </View>
      ) : error ? (
        /* KONDISI ERROR */

        <View style={styles.stateCard}>
          <Text style={styles.errorTitle}>Gagal mengambil data</Text>

          <Text style={styles.errorText}>{error}</Text>

          <Pressable style={styles.button} onPress={loadWeather}>
            <Text style={styles.buttonText}>Coba Lagi</Text>
          </Pressable>
        </View>
      ) : weather ? (
        /* KONDISI BERHASIL */

        <View style={styles.card}>
          <Text style={styles.location}>Universitas Muhammadiyah Malang</Text>

          <Text style={styles.temperature}>
            {weather.temperature.toFixed(1)}°C
          </Text>

          <Text style={styles.condition}>
            {getWeatherDescription(weather.weatherCode)}
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kelembapan</Text>

            <Text style={styles.infoValue}>{weather.humidity}%</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Terasa seperti</Text>

            <Text style={styles.infoValue}>
              {weather.feelsLike.toFixed(1)}°C
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kecepatan angin</Text>

            <Text style={styles.infoValue}>{weather.windSpeed} km/jam</Text>
          </View>

          {/* TOMBOL REFRESH */}

          <Pressable style={styles.button} onPress={loadWeather}>
            <Text style={styles.buttonText}>Perbarui Cuaca</Text>
          </Pressable>

          {/* TOMBOL TEST PROMISE */}
        </View>
      ) : null}
    </ScrollView>
  );
}

// ==================================
// STYLING
// ==================================

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f1f5f9",
    padding: 22,
  },

  eyebrow: {
    color: "#2563eb",
    fontSize: 11,
    fontWeight: "700",
  },

  title: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
  },

  subtitle: {
    color: "#64748b",
    marginTop: 7,
    marginBottom: 22,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 22,
  },

  location: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
  },

  temperature: {
    color: "#0f172a",
    fontSize: 58,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 18,
  },

  condition: {
    color: "#2563eb",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 22,
  },

  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
  },

  infoLabel: {
    color: "#64748b",
    fontSize: 14,
  },

  infoValue: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "700",
  },

  stateCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
  },

  stateText: {
    color: "#64748b",
    marginTop: 14,
  },

  errorTitle: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 17,
  },

  errorText: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 10,
  },

  button: {
    backgroundColor: "#2563eb",
    borderRadius: 11,
    padding: 14,
    alignItems: "center",
    marginTop: 22,
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  testButton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 11,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },

  testButtonText: {
    color: "#1e293b",
    fontWeight: "700",
  },
});
