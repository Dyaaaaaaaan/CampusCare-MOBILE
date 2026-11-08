import { useReports } from "@/store/reports-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reports } = useReports();

  const report = reports.find((item) => item.id === Number(id));

  if (!report) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Laporan tidak ditemukan</Text>
        <Pressable style={styles.button} onPress={() => router.back()}> //router.back()
          <Text style={styles.buttonText}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const color =
    report.status === "Selesai"
      ? "#15803d"
      : report.status === "Diproses"
        ? "#b45309"
        : "#475569";

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>DETAIL LAPORAN #{report.id}</Text>
      <Text style={styles.title}>{report.title}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, { color }]}>{report.status}</Text>

        <Text style={styles.label}>Lokasi</Text>
        <Text style={styles.value}>{report.location}</Text>

        <Text style={styles.label}>Deskripsi</Text>
        <Text style={styles.value}>{report.description}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>‹ Kembali</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, backgroundColor: "#f1f5f9", padding: 22 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f1f5f9",
  },
  eyebrow: { color: "#2563eb", fontWeight: "700", fontSize: 11 },
  title: { color: "#0f172a", fontSize: 27, fontWeight: "800", marginTop: 10 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  label: { color: "#64748b", fontSize: 13, marginTop: 12 },
  value: { color: "#0f172a", fontSize: 16, fontWeight: "600", marginTop: 5 },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#ffffff", fontWeight: "700" },
});
