import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { AppState, Platform } from "react-native";

// Kredensial dibaca dari .env (EXPO_PUBLIC_*), TIDAK di-hardcode.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase belum dikonfigurasi. Salin .env.example menjadi .env lalu isi URL dan anon key.",
  );
}

// Adapter penyimpanan: session Supabase disimpan di hardware vault
// (iOS Keychain / Android Keystore) lewat expo-secure-store.
// Di web, SecureStore tidak tersedia sehingga memakai localStorage.
const isWeb = Platform.OS === "web";
const hasLocalStorage = () => typeof window !== "undefined" && !!window.localStorage;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) return hasLocalStorage() ? window.localStorage.getItem(key) : null;
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      if (hasLocalStorage()) window.localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (isWeb) {
      if (hasLocalStorage()) window.localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Singleton client: dipakai oleh seluruh aplikasi.
// Placeholder dipakai agar import tidak crash saat .env belum diisi.
export const supabase = createClient(
  supabaseUrl || "http://localhost:54321",
  supabaseAnonKey || "missing-anon-key",
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Token hanya di-refresh otomatis saat aplikasi aktif (hemat baterai).
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
