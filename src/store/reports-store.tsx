import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth-context";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export const REPORT_STATUSES = ["Menunggu", "Diproses", "Selesai"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

// Bentuk satu baris tabel `reports` di Supabase.
export interface Report {
  id: string;
  user_id: string;
  title: string;
  location: string;
  description: string;
  status: ReportStatus;
  created_at: string;
}

export type NewReport = Pick<Report, "title" | "location" | "description">;

// Semua aksi tulis mengembalikan pesan error (string) atau null jika sukses.
interface ReportsContextType {
  reports: Report[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addReport: (report: NewReport) => Promise<string | null>;
  updateStatus: (report: Report, status: ReportStatus) => Promise<string | null>;
  deleteReport: (report: Report) => Promise<string | null>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

const byNewest = (a: Report, b: Report) =>
  b.created_at.localeCompare(a.created_at);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mencegah respons lama menimpa data setelah user berganti / logout.
  const requestId = useRef(0);

  // READ (SELECT): urut dari terbaru. Isolasi data dijaga oleh RLS di database,
  // sehingga tidak ada filter user_id di sisi client.
  const load = useCallback(async (mode: "initial" | "refresh") => {
    const current = ++requestId.current;
    if (mode === "initial") setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (current !== requestId.current) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setReports((data ?? []) as Report[]);
      }
    } catch (caught) {
      if (current !== requestId.current) return;
      setError(caught instanceof Error ? caught.message : "Gagal memuat laporan.");
    } finally {
      if (current === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      // Logout: kosongkan data agar tidak bocor ke akun berikutnya.
      requestId.current++;
      setReports([]);
      setError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    load("initial");
  }, [userId, load]);

  const refresh = useCallback(() => load("refresh"), [load]);

  // CREATE (INSERT) + Optimistic UI.
  const addReport = useCallback(
    async (input: NewReport): Promise<string | null> => {
      if (!userId) return "Anda belum masuk.";

      const tempId = `temp-${Date.now()}`;
      const optimistic: Report = {
        id: tempId,
        user_id: userId,
        ...input,
        status: "Menunggu",
        created_at: new Date().toISOString(),
      };

      setReports((current) => [optimistic, ...current]);

      try {
        const { data, error: insertError } = await supabase
          .from("reports")
          .insert({ ...input, status: "Menunggu", user_id: userId })
          .select()
          .single();

        if (insertError || !data) {
          throw new Error(insertError?.message ?? "Gagal menyimpan laporan.");
        }

        // Ganti data sementara dengan baris asli dari server.
        setReports((current) =>
          current.map((item) => (item.id === tempId ? (data as Report) : item)),
        );
        return null;
      } catch (caught) {
        // Rollback.
        setReports((current) => current.filter((item) => item.id !== tempId));
        return caught instanceof Error ? caught.message : "Gagal menyimpan laporan.";
      }
    },
    [userId],
  );

  // UPDATE + Optimistic UI.
  const updateStatus = useCallback(
    async (report: Report, status: ReportStatus): Promise<string | null> => {
      setReports((current) =>
        current.map((item) => (item.id === report.id ? { ...item, status } : item)),
      );

      try {
        const { error: updateError } = await supabase
          .from("reports")
          .update({ status })
          .eq("id", report.id);

        if (updateError) throw new Error(updateError.message);
        return null;
      } catch (caught) {
        // Rollback ke status sebelumnya.
        setReports((current) =>
          current.map((item) => (item.id === report.id ? report : item)),
        );
        return caught instanceof Error ? caught.message : "Gagal memperbarui status.";
      }
    },
    [],
  );

  // DELETE + Optimistic UI.
  const deleteReport = useCallback(
    async (report: Report): Promise<string | null> => {
      setReports((current) => current.filter((item) => item.id !== report.id));

      try {
        const { error: deleteError } = await supabase
          .from("reports")
          .delete()
          .eq("id", report.id);

        if (deleteError) throw new Error(deleteError.message);
        return null;
      } catch (caught) {
        // Rollback: kembalikan item lalu urutkan ulang.
        setReports((current) => [...current, report].sort(byNewest));
        return caught instanceof Error ? caught.message : "Gagal menghapus laporan.";
      }
    },
    [],
  );

  const value = useMemo<ReportsContextType>(
    () => ({
      reports,
      isLoading,
      isRefreshing,
      error,
      refresh,
      addReport,
      updateStatus,
      deleteReport,
    }),
    [reports, isLoading, isRefreshing, error, refresh, addReport, updateStatus, deleteReport],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const context = useContext(ReportsContext);

  if (!context) {
    throw new Error("useReports harus digunakan di dalam ReportProvider.");
  }

  return context;
}
