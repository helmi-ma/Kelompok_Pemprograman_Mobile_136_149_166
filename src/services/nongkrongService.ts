import { supabase } from "@/lib/supabase";
import { TempatNongkrong } from "@/types/nongkrong";

export interface CafeRow {
  id: number | string;
  nama?: string;
  name?: string;
  kategori?: string;
  category?: string;
  rating?: number | null;
  harga?: string | number | null;
  price?: string | number | null;
  jam_buka?: string | null;
  jamBuka?: string | null;
  lokasi?: string | null;
  location?: string | null;
  gambar?: string | null;
  image?: string | null;
}

export interface PaginatedResult {
  data: TempatNongkrong[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=500",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
];

export const mapCafeToTempatNongkrong = (
  item: CafeRow,
  index: number = 0
): TempatNongkrong => {
  const hargaVal = item.harga ?? item.price;
  let formattedHarga = "Rp 18.000 - Rp 45.000";

  if (typeof hargaVal === "string" && hargaVal.trim().length > 0) {
    formattedHarga = hargaVal;
  } else if (typeof hargaVal === "number") {
    formattedHarga = `Rp ${hargaVal.toLocaleString("id-ID")}`;
  }

  return {
    id: String(item.id ?? index + 1),
    nama: item.nama || item.name || `Kafe #${index + 1}`,
    kategori: item.kategori || item.category || "Kafe",
    rating: Number(item.rating) || 4.7,
    harga: formattedHarga,
    jamBuka: item.jam_buka || item.jamBuka || "08.00 - 23.00",
    lokasi: item.lokasi || item.location || "Malang",
    gambar:
      item.gambar ||
      item.image ||
      DEFAULT_IMAGES[index % DEFAULT_IMAGES.length],
  };
};

/**
 * Mengambil data kafe dari tabel `cafes` di database Supabase dengan pagination.
 *
 * @param page Halaman yang diminta (dimulai dari 1)
 * @param pageSize Jumlah data per halaman (default: 10)
 * @param search Query filter nama atau lokasi (opsional)
 * @param kategori Filter kategori (opsional)
 */
export const getPlacesFromSupabase = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  kategori?: string
): Promise<PaginatedResult> => {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("cafes")
    .select("*", { count: "exact" });

  if (search && search.trim().length > 0) {
    const cleaned = search.trim();
    query = query.or(`nama.ilike.%${cleaned}%,lokasi.ilike.%${cleaned}%`);
  }

  if (kategori && kategori !== "Semua") {
    query = query.eq("kategori", kategori);
  }

  const { data, count, error } = await query
    .order("id", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Supabase getPlaces error:", error);
    throw new Error(error.message);
  }

  const items = (data || []) as CafeRow[];
  const mapped = items.map((row, idx) => mapCafeToTempatNongkrong(row, from + idx));
  const total = count ?? mapped.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    data: mapped,
    total,
    totalPages,
    page: safePage,
    pageSize,
  };
};

/**
 * Alias kompatibilitas jika dipanggil tanpa opsi pagination
 */
export const getPlacesAsync = async (page: number = 1, pageSize: number = 10): Promise<TempatNongkrong[]> => {
  const res = await getPlacesFromSupabase(page, pageSize);
  return res.data;
};
