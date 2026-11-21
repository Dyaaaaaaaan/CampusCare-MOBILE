import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const TOKEN_KEY = "campuscare_user_token";
const isWeb = Platform.OS === "web";

// SecureStore tidak tersedia di web -> fallback ke localStorage (hanya untuk demo).
async function saveToken(token: string) {
  if (isWeb) return window.localStorage.setItem(TOKEN_KEY, token);
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function loadToken(): Promise<string | null> {
  if (isWeb) return window.localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function wipeToken() {
  if (isWeb) return window.localStorage.removeItem(TOKEN_KEY);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export default function SecureVaultDemo() {
  const [input, setInput] = useState("");
  const [vaultValue, setVaultValue] = useState<string | null>(null);
  const [status, setStatus] = useState("Belum ada aksi.");

  async function handleSave() {
    const token = input.trim();
    if (!token) {
      setStatus("Token tidak boleh kosong.");
      return;
    }
    try {
      await saveToken(token);
      setInput("");
      setStatus("Token tersimpan di vault terenkripsi.");
    } catch (error) {
      setStatus(`Gagal menyimpan: ${String(error)}`);
    }
  }

  async function handleLoad() {
    try {
      const token = await loadToken();
      setVaultValue(token);
      setStatus(token ? "Token berhasil dimuat." : "Tidak ada token di storage.");
    } catch (error) {
      setStatus(`Gagal memuat: ${String(error)}`);
    }
  }

  async function handleWipe() {
    try {
      await wipeToken();
      setVaultValue(null);
      setStatus("Token dihapus dari storage.");
    } catch (error) {
      setStatus(`Gagal menghapus: ${String(error)}`);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Encrypted Vault Demo</Text>
      <Text style={styles.platform}>
        Platform: {isWeb ? "Web Browser (localStorage)" : "SecureStore (Keychain/Keystore)"}
      </Text>

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Masukkan token..."
        placeholderTextColor="#94a3b8"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      <Pressable style={styles.primary} onPress={handleSave}>
        <Text style={styles.primaryText}>Simpan Token</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={handleLoad}>
        <Text style={styles.secondaryText}>Muat Token</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={handleWipe}>
        <Text style={styles.secondaryText}>Hapus Token</Text>
      </Pressable>

      <Text style={styles.status}>{status}</Text>

      {vaultValue ? (
        <View style={styles.vaultBox}>
          <Text style={styles.vaultLabel}>ISI VAULT</Text>
          <Text style={styles.vaultValue}>{vaultValue}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a", textAlign: "center" },
  platform: { fontSize: 11, color: "#64748b", textAlign: "center", marginTop: 6, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    color: "#0f172a",
    fontSize: 15,
    marginBottom: 12,
  },
  primary: { backgroundColor: "#2563eb", borderRadius: 12, padding: 14, alignItems: "center" },
  primaryText: { color: "#ffffff", fontWeight: "700" },
  secondary: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryText: { color: "#334155", fontWeight: "600" },
  status: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    color: "#475569",
    textAlign: "center",
    fontSize: 13,
  },
  vaultBox: { marginTop: 10, padding: 12, borderRadius: 10, backgroundColor: "#eff6ff" },
  vaultLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1, color: "#2563eb" },
  vaultValue: { marginTop: 4, fontSize: 15, fontWeight: "700", color: "#0f172a" },
});
