import { REPORT_STATUSES, ReportStatus, useReports } from "@/store/reports-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reports, updateStatus, deleteReport } = useReports();
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const report = reports.find((item) => item.id === id);

  async function handleStatus(status: ReportStatus) {
    if (!report || report.status === status) return;
    setError("");
    const failure = await updateStatus(report, status); // UPDATE
    if (failure) setError(failure);
  }

  async function handleDelete() {
    if (!report) return;
    setError("");
    const failure = await deleteReport(report); // DELETE
    if (failure) {
      setError(failure);
      setConfirmDelete(false);
      return;
    }
    router.back();
  }

  if (!report) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Laporan tidak ditemukan</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
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
      <Text style={styles.eyebrow}>DETAIL LAPORAN #{report.id.slice(0, 8).toUpperCase()}</Text>
      <Text style={styles.title}>{report.title}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, { color }]}>{report.status}</Text>

        <Text style={styles.label}>Lokasi</Text>
        <Text style={styles.value}>{report.location}</Text>

        <Text style={styles.label}>Deskripsi</Text>
        <Text style={styles.value}>{report.description}</Text>
      </View>

      <Text style={styles.sectionLabel}>Ubah status</Text>
      <View style={styles.statusRow}>
        {REPORT_STATUSES.map((status) => (
          <Pressable
            key={status}
            style={[styles.chip, report.status === status && styles.chipActive]}
            onPress={() => handleStatus(status)}
          >
            <Text
              style={[
                styles.chipText,
                report.status === status && styles.chipTextActive,
              ]}
            >
              {status}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>‹ Kembali</Text>
      </Pressable>

      {confirmDelete ? (
        <View style={styles.confirmRow}>
          <Pressable style={styles.danger} onPress={handleDelete}>
            <Text style={styles.buttonText}>Ya, hapus</Text>
          </Pressable>
          <Pressable style={styles.cancel} onPress={() => setConfirmDelete(false)}>
            <Text style={styles.cancelText}>Batal</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.deleteLink} onPress={() => setConfirmDelete(true)}>
          <Text style={styles.deleteText}>Hapus Laporan</Text>
        </Pressable>
      )}
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
  sectionLabel: { color: "#334155", fontWeight: "700", marginBottom: 10 },
  statusRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  chipActive: { backgroundColor: "#dbeafe", borderColor: "#2563eb" },
  chipText: { color: "#475569", fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: "#1d4ed8" },
  error: { color: "#dc2626", marginBottom: 12 },
  confirmRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  danger: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { color: "#475569", fontWeight: "600" },
  deleteLink: { padding: 14, alignItems: "center", marginTop: 6 },
  deleteText: { color: "#dc2626", fontWeight: "700" },
});
