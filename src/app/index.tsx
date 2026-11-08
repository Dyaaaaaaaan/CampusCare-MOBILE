import { Report, useReports } from "@/store/reports-store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

function statusColor(status: Report["status"]) {
  switch (status) {
    case "Selesai":
      return "#15803d";
    case "Diproses":
      return "#b45309";
    default:
      return "#475569";
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { reports } = useReports();

  const [lastUpdated, setLastUpdated] = useState(""); //useState + useEffect

  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [reports]);

  const waiting = reports.filter((r) => r.status === "Menunggu").length;
  const processing = reports.filter((r) => r.status === "Diproses").length;
  const completed = reports.filter((r) => r.status === "Selesai").length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>SISTEM PELAPORAN FASILITAS KAMPUS</Text>
      <Text style={styles.title}>CampusCare</Text>
      <Text style={styles.subtitle}>
        Laporkan masalah fasilitas kampus dengan mudah.
      </Text>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Laporan</Text>
        <Text style={styles.totalNumber}>{reports.length}</Text>
        <Text style={styles.updated}>Terakhir diperbarui: {lastUpdated}</Text>
      </View>

      <Text style={styles.sectionTitle}>Ringkasan Status</Text>

      <View style={styles.summaryRow}>
        <Summary label="Menunggu" value={waiting} color="#64748b" />
        <Summary label="Diproses" value={processing} color="#d97706" />
        <Summary label="Selesai" value={completed} color="#15803d" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daftar Laporan</Text>
        <Text style={styles.count}>{reports.length} laporan</Text>
      </View>

      {reports.length === 0 ? (
        <Text style={styles.empty}>Belum ada laporan fasilitas.</Text>
      ) : (
        reports.map((report) => (
          <Pressable
            key={report.id}
            style={styles.reportCard}
            onPress={() =>
              router.push({
                pathname: "/detail",
                params: { id: String(report.id) },
              })
            }
          >
            <View style={styles.reportIcon}>
              <Text style={styles.iconText}>!</Text>
            </View>

            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.location}>{report.location}</Text>
              <Text
                style={[styles.status, { color: statusColor(report.status) }]}
              >
                {report.status}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))
      )}

      <Pressable
        style={styles.primaryButton}
        onPress={() => router.push("/create-report")} //router.push()
      >
        <Text style={styles.primaryButtonText}>+ Buat Laporan Baru</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push("/explore")}
      >
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/weather")}
        >
          <Text style={styles.secondaryButtonText}>Informasi Cuaca Kampus</Text>
        </Pressable>
        <Text style={styles.secondaryButtonText}>Informasi Aplikasi</Text>
      </Pressable>
    </ScrollView>
  );
}

function Summary({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryNumber, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { padding: 20, paddingBottom: 40 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#2563eb",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 8,
  },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 5, marginBottom: 20 },
  totalCard: {
    backgroundColor: "#1d4ed8",
    borderRadius: 18,
    padding: 22,
    marginBottom: 24,
  },
  totalLabel: { color: "#dbeafe", fontSize: 14 },
  totalNumber: { color: "#ffffff", fontSize: 42, fontWeight: "800" },
  updated: { color: "#dbeafe", fontSize: 11, marginTop: 5 },
  sectionTitle: { color: "#0f172a", fontSize: 18, fontWeight: "700" },
  summaryRow: { flexDirection: "row", gap: 8, marginTop: 12, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  summaryNumber: { fontSize: 24, fontWeight: "800" },
  summaryLabel: { color: "#64748b", fontSize: 11, marginTop: 5 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  count: { color: "#64748b", fontSize: 12 },
  empty: {
    color: "#64748b",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
  },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  reportIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: { color: "#1d4ed8", fontWeight: "800", fontSize: 22 },
  reportInfo: { flex: 1 },
  reportTitle: { color: "#0f172a", fontSize: 15, fontWeight: "700" },
  location: { color: "#64748b", fontSize: 12, marginTop: 4 },
  status: { fontSize: 12, fontWeight: "700", marginTop: 7 },
  arrow: { color: "#64748b", fontSize: 28, paddingHorizontal: 5 },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButtonText: { color: "#334155", fontWeight: "600" },
});

//but butten tulisanya hello kwtika di clik jadi selamat datang
//buatkan button kalo di clik jadi brubah warna
// ketika buttonya di tekan maka akan ada fungsu dimana butten akan menghitung ketika di tekan
