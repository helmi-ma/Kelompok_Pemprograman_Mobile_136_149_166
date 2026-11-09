import { ApiCustomTempatNongkrong } from "@/types/api";
import { TempatNongkrong } from "@/types/nongkrong";

const EXTERNAL_API_URL = "https://dummyjson.com/c/099d-b825-41f5-820d";

export const delaySimulation = (ms: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (ms < 0) {
      reject(new Error("Waktu penundaan tidak boleh negatif"));
    } else {
      setTimeout(() => {
        resolve();
      }, ms);
    }
  });
};

export const fetchTempatNongkrongFromApi = (): Promise<TempatNongkrong[]> => {
  return new Promise((resolve, reject) => {
    fetch(EXTERNAL_API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP Error Status: ${response.status}`);
        }
        return response.json();
      })
      .then((jsonResult: any) => {
        const rawItems: ApiCustomTempatNongkrong[] = Array.isArray(jsonResult)
          ? jsonResult
          : jsonResult.data || jsonResult.nongkrong || jsonResult.products || [];

        const mappedData: TempatNongkrong[] = rawItems.map(
          (item: ApiCustomTempatNongkrong, index: number) => {
            const defaultImages = [
              "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500",
              "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=500",
              "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500",
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
            ];

            return {
              id: String(item.id || index + 1),
              nama: item.nama || item.name || item.title || `Kafe #${index + 1}`,
              kategori: item.kategori || item.category || "Kafe",
              rating: Number(item.rating) || 4.7,
              harga:
                typeof item.harga === "string"
                  ? item.harga
                  : typeof item.price === "string"
                  ? item.price
                  : item.harga || item.price
                  ? `Rp ${Number(item.harga || item.price).toLocaleString("id-ID")}`
                  : "Rp 18.000 - Rp 45.000",
              jamBuka: item.jamBuka || item.jam_buka || "08.00 - 23.00",
              lokasi: item.lokasi || item.location || "Lowokwaru, Malang",
              gambar:
                item.gambar ||
                item.image ||
                item.thumbnail ||
                defaultImages[index % defaultImages.length],
            };
          }
        );

        resolve(mappedData);
      })
      .catch((error) => {
        console.error("Gagal mengambil data dari API Custom, menggunakan fallback:", error);

        const fallbackData: TempatNongkrong[] = [
          {
            id: "1",
            nama: "Nakoa Cafe Suhat",
            kategori: "Outdoor",
            rating: 4.8,
            harga: "Rp 18.000 - Rp 38.000",
            jamBuka: "24 Jam",
            lokasi: "Lowokwaru, Malang",
            gambar: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500",
          },
          {
            id: "2",
            nama: "Dialoogi Space & Coffee",
            kategori: "Workspace",
            rating: 4.7,
            harga: "Rp 25.000 - Rp 55.000",
            jamBuka: "09.00 - 22.00",
            lokasi: "Klojen, Malang",
            gambar: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=500",
          },
        ];
        resolve(fallbackData);
      });
  });
};

export const getPlacesAsync = async (): Promise<TempatNongkrong[]> => {
  await delaySimulation(1000);

  const data = await fetchTempatNongkrongFromApi();
  
  return data;
};