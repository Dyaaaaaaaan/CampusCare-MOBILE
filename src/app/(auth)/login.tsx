import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Feedback = { type: "error" | "success"; message: string } | null;

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleAuth() {
    // Cegah multiple submission.
    if (loading) return;

    // Sanitasi input: kill the invisible spaces.
    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    if (!cleanEmail || !password) {
      setFeedback({ type: "error", message: "Email dan password wajib diisi." });
      return;
    }
    if (password.length < 6) {
      setFeedback({ type: "error", message: "Password minimal 6 karakter." });
      return;
    }
    if (isRegistering && !cleanName) {
      setFeedback({ type: "error", message: "Nama lengkap wajib diisi." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      if (isRegistering) {
        // REGISTER: sign-up + metadata (nama & role).
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { full_name: cleanName, role: "mahasiswa" } },
        });

        if (error) {
          setFeedback({ type: "error", message: error.message });
          return;
        }

        if (data.session) {
          // Confirm email nonaktif -> langsung punya sesi; guard mengarahkan ke Home.
          router.replace("/");
        } else {
          // Confirm email aktif -> user harus verifikasi lewat email dulu.
          setFeedback({
            type: "success",
            message: "Pendaftaran berhasil. Cek email untuk verifikasi, lalu masuk.",
          });
          setIsRegistering(false);
        }
      } else {
        // LOGIN: sign-in dengan email & password.
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setFeedback({ type: "error", message: error.message });
          return;
        }

        router.replace("/");
      }
    } catch (error) {
      // Error jaringan / tak terduga: tampilkan pesan, jangan crash.
      const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
      setFeedback({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    if (loading) return;
    setIsRegistering((value) => !value);
    setFeedback(null);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>SISTEM PELAPORAN FASILITAS KAMPUS</Text>
        <Text style={styles.title}>{isRegistering ? "Daftar Akun" : "Masuk"}</Text>
        <Text style={styles.subtitle}>
          {isRegistering
            ? "Buat akun mahasiswa untuk mulai melapor."
            : "Masuk untuk melihat dan membuat laporan Anda."}
        </Text>

        <View style={styles.form}>
          {!isSupabaseConfigured ? (
            <Text style={styles.warning}>
              Supabase belum dikonfigurasi. Isi EXPO_PUBLIC_SUPABASE_URL dan
              EXPO_PUBLIC_SUPABASE_ANON_KEY di file .env.
            </Text>
          ) : null}

          {isRegistering ? (
            <>
              <Text style={styles.label}>Nama lengkap</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Contoh: Diandra"
                autoCapitalize="words"
                editable={!loading}
                style={styles.input}
              />
            </>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="nama@student.umm.ac.id"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Minimal 6 karakter"
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
            onSubmitEditing={handleAuth}
            style={styles.input}
          />

          {feedback ? (
            <Text
              style={feedback.type === "error" ? styles.error : styles.success}
            >
              {feedback.message}
            </Text>
          ) : null}

          <Pressable
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitText}>
                {isRegistering ? "Daftar" : "Masuk"}
              </Text>
            )}
          </Pressable>

          <Pressable style={styles.toggle} onPress={toggleMode}>
            <Text style={styles.toggleText}>
              {isRegistering
                ? "Sudah punya akun? Masuk di sini"
                : "Belum punya akun? Daftar di sini"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { flexGrow: 1, justifyContent: "center", padding: 22 },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1.1, color: "#2563eb" },
  title: { fontSize: 34, fontWeight: "800", color: "#0f172a", marginTop: 8 },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 5, marginBottom: 22 },
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
  warning: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 6,
  },
  error: { color: "#dc2626", marginVertical: 8 },
  success: { color: "#15803d", marginVertical: 8 },
  submit: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 12,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: "#ffffff", fontWeight: "700" },
  toggle: { padding: 14, alignItems: "center" },
  toggleText: { color: "#2563eb", fontWeight: "600" },
});
