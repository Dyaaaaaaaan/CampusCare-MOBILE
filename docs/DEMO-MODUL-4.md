# DEMO Modul 4 — Database & Authentication (CampusCare)

Tema: **CampusCare** (pelaporan fasilitas kampus). "Mission" di modul = **laporan fasilitas** (`reports`).

## 1. Setup (sekali saja)

1. Supabase Dashboard → buat project → **Project Settings → API** → salin *Project URL* dan *anon key*.
2. Salin `.env.example` → `.env`, isi dua variabel `EXPO_PUBLIC_SUPABASE_*`. (`.env` sudah di-`.gitignore`, jangan di-commit.)
3. **Authentication → Sign In / Providers → Email** → matikan **Confirm email** → Save (agar register langsung bisa login).
4. **SQL Editor → New query** → tempel isi `supabase/schema.sql` → Run (tabel `reports` + RLS).
5. `npm install` lalu `npx expo start --go` (atau `npx expo start --web`). Restart Metro setiap `.env` berubah.

## 2. Peta kriteria penilaian → file

| Kriteria (bobot) | Di mana | Inti yang dijelaskan |
|---|---|---|
| Secure Token Storage (5%) | `src/lib/supabase.ts` (`ExpoSecureStoreAdapter`), `src/components/secure-vault-demo.tsx`, route `/vault` | Session JWT disimpan via `expo-secure-store` (Keychain/Keystore), bukan AsyncStorage. Di web fallback ke `localStorage`. |
| Supabase Auth Flow (5%) | `src/app/(auth)/login.tsx` → `handleAuth` | `signUp` (+ metadata `full_name`, `role`), `signInWithPassword`, `signOut` (tombol *Keluar* di Home via `useAuth`), loading state, anti double-submit, `.trim()` email, error ditampilkan tanpa crash. |
| Global AuthContext & Real-time Session (10%) | `src/store/auth-context.tsx` | `getSession()` saat startup (rehydration dari vault) + `onAuthStateChange()` (SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED) + cleanup `unsubscribe()`. |
| Route Protection Guards (10%) | `src/app/_layout.tsx` → `RootNavigator` | `useSegments()`: loading → tidak redirect; belum login & bukan di `(auth)` → `/login`; sudah login & di `(auth)` → `/`; logout → `/login`. Spinner overlay mencegah layout flickering. |
| Codelab 5 (CRUD + RLS) | `src/store/reports-store.tsx`, `src/app/(app)/index.tsx`, `detail.tsx`, `create-report.tsx`, `supabase/schema.sql` | SELECT (urut terbaru), INSERT, UPDATE status, DELETE; pull-to-refresh; optimistic UI + rollback; isolasi data oleh RLS. |

Struktur route: `(auth)/login` dan `(app)/…`. Nama grup tidak muncul di URL, jadi `/`, `/detail`, `/create-report` dst. tetap sama dengan Modul 2–3.

## 3. Skenario demo (urutan yang disarankan)

1. Buka app tanpa sesi → otomatis ke **/login** (Cold start).
2. Login dengan password salah → pesan *Invalid login credentials*, app tidak crash.
3. Daftar akun A → langsung masuk Home. Cek **Authentication → Users** di Supabase.
4. Buat 2 laporan → muncul langsung (optimistic). Tarik layar ke bawah untuk refresh.
5. Reload app / F5 → tetap login (sesi dari vault) dan data kembali.
6. Buka detail → ubah status, lalu hapus satu laporan.
7. **Keluar** → kembali ke /login. Daftar akun B → daftar kosong (isolasi RLS). Login lagi sebagai A → laporan A masih ada.
8. (Opsional) `/vault` lewat tombol *Brankas Token*: Simpan → Muat → Hapus.

## 4. Persiapan pertanyaan asisten

- **Mengapa bukan AsyncStorage untuk token?** AsyncStorage = SQLite tanpa enkripsi (plaintext). SecureStore memakai iOS Keychain / Android Keystore.
- **Mengapa perlu storage adapter?** `supabase-js` mengharapkan `localStorage` (web). Di React Native tidak ada, jadi kita suplai `getItem/setItem/removeItem` yang mengarah ke SecureStore.
- **Anon key ada di app, bahaya?** Anon key bersifat publik. Yang melindungi data adalah **RLS**: Postgres memeriksa `auth.uid() = user_id` dari JWT pada tiap query. Tanpa JWT valid hasilnya array kosong.
- **Mengapa tidak ada `.eq('user_id', …)` di SELECT?** Sengaja: isolasi dijaga database. Filter di client bisa menutupi RLS yang salah.
- **Access vs Refresh token?** Access JWT berumur pendek, dikirim di tiap query. Refresh token berumur panjang untuk meminta access token baru tanpa input password.
- **Mengapa `isLoading` di AuthContext?** Membaca vault itu async. Tanpa `isLoading`, user yang sebenarnya login sempat dianggap "belum login" lalu ter-redirect (flicker).
- **Mengapa `.trim()` email?** Autocomplete keyboard sering menambah spasi di akhir; bagi database spasi itu bagian dari email.
- **Apa itu optimistic UI?** UI diperbarui dulu sebelum server menjawab; jika gagal, state dikembalikan (rollback) dan error ditampilkan.
- **Mengapa `user_id` default `auth.uid()` dan juga dikirim dari client?** Default menjaga integritas di sisi database; policy `WITH CHECK` menolak insert untuk user lain.

## 5. Ide tantangan live-code (5 menit) & titik ubahnya

- Ganti redirect setelah login → `RootNavigator` di `src/app/_layout.tsx` (`router.replace("/")`).
- Tambah field baru (mis. `category`) → kolom di `schema.sql`, tipe `Report`, form `create-report.tsx`.
- Ubah minimal password / validasi email → `handleAuth` di `login.tsx`.
- Filter laporan "Menunggu saja" → di `index.tsx` (`reports.filter(...)`) atau `.eq("status", ...)` di `load()` pada `reports-store.tsx`.
- Tambah pesan sambutan nama user → `user.user_metadata.full_name` (lihat bagian atas `index.tsx`).

## 6. Catatan teknis

- `expo-secure-store` menyarankan nilai ≤ 2048 byte. Session Supabase biasanya masih muat; jika suatu saat gagal, solusi umum adalah memecah nilai (chunking) atau enkripsi AES dengan kunci di SecureStore.
- `role` di `user_metadata` hanya label tampilan. Jangan dipakai untuk otorisasi (bisa diubah user); gunakan tabel/claim di sisi server bila nanti butuh peran admin.
- `Alert.alert` tidak berfungsi di web, jadi pesan sukses/error memakai teks inline agar jalan di Expo Go maupun web.
