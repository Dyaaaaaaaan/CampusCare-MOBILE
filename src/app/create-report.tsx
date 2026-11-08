import { useReports } from "@/store/reports-store";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function CreateReportScreen() {
  const router = useRouter();
  const { addReport } = useReports();

  const [title, setTitle] = useState(""); //state
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const cleanTitle = title.trim();
    const cleanLocation = location.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanLocation || !cleanDescription) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    addReport({
      title: cleanTitle,
      location: cleanLocation,
      description: cleanDescription,
      status: "Menunggu",
    });

    Alert.alert("Berhasil", "Laporan berhasil ditambahkan.", [
      {
        text: "OK",
        onPress: () => router.replace("/"), // router.replace() 
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Buat Laporan</Text>
        <Text style={styles.subtitle}>
          Isi informasi fasilitas kampus yang bermasalah.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Judul laporan</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Contoh: Lampu kelas mati"
            style={styles.input}
          />

          <Text style={styles.label}>Lokasi fasilitas</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Contoh: Gedung Kuliah"
            style={styles.input}
          />

          <Text style={styles.label}>Deskripsi masalah</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Jelaskan kerusakannya"
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.multiline]}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.submit} onPress={handleSubmit}>
            <Text style={styles.submitText}>Kirim Laporan</Text>
          </Pressable>

          <Pressable style={styles.cancel} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Batal dan Kembali</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { flexGrow: 1, padding: 22 },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  subtitle: { color: "#64748b", marginTop: 7, marginBottom: 22 },
  form: { backgroundColor: "#ffffff", borderRadius: 16, padding: 18 },
  label: { fontSize: 14, fontWeight: "700", color: "#334155", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    marginTop: 7,
    marginBottom: 8,
    color: "#0f172a",
    fontSize: 15,
  },
  multiline: { minHeight: 110 },
  error: { color: "#dc2626", marginVertical: 8 },
  submit: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 12,
  },
  submitText: { color: "#ffffff", fontWeight: "700" },
  cancel: { padding: 14, alignItems: "center" },
  cancelText: { color: "#475569", fontWeight: "600" },
});
