export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Interface fleksibel untuk membaca item respons JSON dari API Custom DummyJSON Anda
export interface ApiCustomTempatNongkrong {
  id: string | number;
  nama?: string;
  name?: string;
  title?: string;
  kategori?: string;
  category?: string;
  rating?: number;
  harga?: string | number;
  price?: string | number;
  jamBuka?: string;
  jam_buka?: string;
  lokasi?: string;
  location?: string;
  gambar?: string;
  image?: string;
  thumbnail?: string;
}