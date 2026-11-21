import { useReports } from "@/store/reports-store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ExploreScreen() {
  const router = useRouter();
  const { reports } = useReports();
  const [lastUpdated, setLastUpdated] = useState(""); //useState + useEffect

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString("id-ID"));
  }, [reports]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>TENTANG APLIKASI</Text>
      <Text style={styles.title}>CampusCare</Text>

      <Text style={styles.description}>
        CampusCare adalah aplikasi untuk membantu mahasiswa melaporkan fasilitas
        kampus yang rusak atau memerlukan perbaikan.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cara menggunakan</Text>
        <Text style={styles.step}>1. Buka halaman utama.</Text>
        <Text style={styles.step}>2. Pilih Buat Laporan Baru.</Text>
        <Text style={styles.step}>3. Isi judul, lokasi, dan deskripsi.</Text>
        <Text style={styles.step}>4. Kirim laporan untuk ditampilkan.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ringkasan aplikasi</Text>
        <Text style={styles.description}>Total laporan: {reports.length}</Text>
        <Text style={styles.updated}>Terakhir diperbarui: {lastUpdated}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Kembali</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 22, backgroundColor: "#f1f5f9" },
  eyebrow: { color: "#2563eb", fontSize: 11, fontWeight: "700" },
  title: { color: "#0f172a", fontSize: 32, fontWeight: "800", marginTop: 8 },
  description: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },
  step: { color: "#475569", lineHeight: 25 },
  updated: { color: "#64748b", fontSize: 12, marginTop: 8 },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 22,
  },
  buttonText: { color: "#ffffff", fontWeight: "700" },
});
