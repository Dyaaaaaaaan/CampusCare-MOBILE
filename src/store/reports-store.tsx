import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

export type ReportStatus = "Menunggu" | "Diproses" | "Selesai";

export interface Report {
  id: number;
  title: string;
  location: string;
  description: string;
  status: ReportStatus;
}

interface ReportsContextType {
  reports: Report[];
  addReport: (report: Omit<Report, "id">) => void;
  isLoaded: boolean;
}

const STORAGE_KEY = "@campuscare/reports";

const initialReports: Report[] = [
  {
    id: 1,
    title: "Lampu Kelas Mati",
    location: "Gedung Kuliah Bersama",
    description: "Lampu di kelas 101 tidak menyala.",
    status: "Diproses",
  },
  {
    id: 2,
    title: "Kursi Rusak",
    location: "Laboratorium Informatika",
    description: "Beberapa kursi perlu diperbaiki.",
    status: "Menunggu",
  },
  {
    id: 3,
    title: "Keran Air Rusak",
    location: "Gedung Teknik",
    description: "Keran air di toilet lantai dua tidak berfungsi.",
    status: "Selesai",
  },
];

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>(initialReports); //useState + useEffect
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const savedReports = await AsyncStorage.getItem(STORAGE_KEY);

        if (!active) return;

        if (savedReports !== null) {
          const parsedReports: unknown = JSON.parse(savedReports);

          if (
            Array.isArray(parsedReports) &&
            parsedReports.every(
              (item) =>
                item &&
                typeof item.id === "number" &&
                typeof item.title === "string" &&
                typeof item.location === "string" &&
                typeof item.description === "string" &&
                ["Menunggu", "Diproses", "Selesai"].includes(item.status),
            )
          ) {
            setReports(parsedReports as Report[]);
          }
        } else {
          // Simpan data awal hanya saat belum ada data tersimpan.
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(initialReports),
          );
        }
      } catch (error) {
        console.error("Gagal memuat laporan:", error);
      } finally {
        if (active) setIsLoaded(true);
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  // Menyimpan laporan setelah data awal selesai dimuat.
  useEffect(() => {
    if (!isLoaded) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports)).catch(
      (error: unknown) => {
        console.error("Gagal menyimpan laporan:", error);
      },
    );
  }, [reports, isLoaded]);

  const addReport = useCallback((newReport: Omit<Report, "id">) => {
    setReports((currentReports) => {
      const nextId =
        currentReports.length > 0
          ? Math.max(...currentReports.map((report) => report.id)) + 1
          : 1;

      return [{ ...newReport, id: nextId }, ...currentReports];
    });
  }, []);

  return (
    <ReportsContext.Provider value={{ reports, addReport, isLoaded }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);

  if (!context) {
    throw new Error("useReports harus digunakan di dalam ReportProvider.");
  }

  return context;
}
