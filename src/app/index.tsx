import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TempatNongkrong } from "./Nongkrongyuk";

// Data Dummy Tempat Nongkrong
const DATA_NONGKRONG: TempatNongkrong[] = [
  {
    id: "1",
    nama: "Senja Coffee & Space",
    kategori: "Workspace",
    rating: 4.8,
    harga: "Rp 18.000 - Rp 45.000",
    jamBuka: "08.00 - 23.00",
    lokasi: "Lowokwaru, Malang",
    gambar: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500",
  },
  {
    id: "2",
    nama: "Kopi Tepi Jalan",
    kategori: "Outdoor",
    rating: 4.6,
    harga: "Rp 12.000 - Rp 30.000",
    jamBuka: "15.00 - 01.00",
    lokasi: "Sukun, Malang",
    gambar:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500",
  },
  {
    id: "3",
    nama: "Skyline Rooftop & Eatery",
    kategori: "Rooftop",
    rating: 4.9,
    harga: "Rp 25.000 - Rp 85.000",
    jamBuka: "16.00 - 24.00",
    lokasi: "Klojen, Malang",
    gambar:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
  },
  {
    id: "4",
    nama: "Rustic Artisan Cafe",
    kategori: "Kafe",
    rating: 4.7,
    harga: "Rp 20.000 - Rp 50.000",
    jamBuka: "09.00 - 22.00",
    lokasi: "Blimbing, Malang",
    gambar: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500",
  },
];

const KATEGORI_LIST = ["Semua", "Kafe", "Workspace", "Outdoor", "Rooftop"];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriTerpilih, setKategoriTerpilih] = useState("Semua");

  // Filter Data berdasarkan Pencarian & Kategori
  const filteredData = DATA_NONGKRONG.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori =
      kategoriTerpilih === "Semua" || item.kategori === kategoriTerpilih;
    return matchSearch && matchKategori;
  });

  const handleDetail = (item: TempatNongkrong) => {
    Alert.alert(
      item.nama,
      `Kategori: ${item.kategori}
  Rating: ${item.rating}
  Lokasi: ${item.lokasi}
  Jam buka: ${item.jamBuka}
  Kisaran harga: ${item.harga}`,
      [
        {
          text: "Tutup",
          style: "cancel",
        },
      ],
    );
  };

  const renderCard = ({ item }: { item: TempatNongkrong }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image source={{ uri: item.gambar }} style={styles.cardImage} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.nama}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>Rating {item.rating}</Text>
          </View>
        </View>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{item.kategori}</Text>
        </View>

        <Text style={styles.infoText}>Lokasi: {item.lokasi}</Text>
        <Text style={styles.infoText}>Jam buka: {item.jamBuka}</Text>
        <Text style={styles.priceLabel}>Kisaran harga</Text>
        <Text style={styles.priceText}>{item.harga}</Text>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => handleDetail(item)}
        >
          <Text style={styles.detailButtonText}>Lihat Detail</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>
          Temukan tempat Nongkrong asik di Kota Malang ☕
        </Text>
        <Text style={styles.headerTitle}>Nongkrongyuk</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.sectionTitle}>Cari tempat</Text>
        <TextInput
          style={styles.searchInput}
          accessibilityLabel="Cari nama tempat atau lokasi"
          placeholder="Contoh: kafe atau Lowokwaru"
          placeholderTextColor="#727A7C"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      <View style={styles.categorySection}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Pilih jenis tempat</Text>
          <Text style={styles.sectionHint}>Ketuk kategori untuk menyaring</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {KATEGORI_LIST.map((kategori) => {
            const isActive = kategoriTerpilih === kategori;
            return (
              <TouchableOpacity
                key={kategori}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
                onPress={() => setKategoriTerpilih(kategori)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {kategori}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List Tempat Nongkrong */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.resultCount}>
            {filteredData.length} tempat ditemukan
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Belum ada tempat yang cocok</Text>
            <Text style={styles.emptyText}>
              Coba kata pencarian lain atau pilih kategori Semua.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery("");
                setKategoriTerpilih("Semua");
              }}
              accessibilityRole="button"
            >
              <Text style={styles.resetButtonText}>Tampilkan semua tempat</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// Styling Eksternal / Internal
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F6",
  },
  detailButton: {
    backgroundColor: "#246A59",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },

  detailButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 18,
  },
  brand: {
    fontSize: 11,
    fontWeight: "800",
    color: "#347A69",
    marginBottom: 9,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#586361",
    marginTop: 5,
  },
  headerTitle: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "800",
    color: "#1D302C",
  },
  searchContainer: {
    paddingHorizontal: 22,
    marginBottom: 18,
  },
  sectionHeading: {
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: "#1D302C",
  },
  sectionHint: {
    fontSize: 13,
    color: "#687370",
    marginTop: 2,
  },
  categorySection: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginTop: 9,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#DCE5E1",
    color: "#1D302C",
  },
  categoryContainer: {
    paddingHorizontal: 22,
    alignItems: "center",
    paddingBottom: 3,
  },
  categoryChip: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#E6ECE9",
    marginRight: 9,
  },
  categoryChipActive: {
    backgroundColor: "#246A59",
  },
  categoryText: {
    fontSize: 14,
    color: "#35413E",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContainer: {
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#687370",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E7E3",
  },
  cardImage: {
    width: "100%",
    height: 148,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    color: "#1D302C",
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    backgroundColor: "#FFF0D7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8B4B16",
  },
  badgeContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F2EE",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 5,
    marginBottom: 9,
  },
  badgeText: {
    fontSize: 12,
    color: "#246A59",
    fontWeight: "600",
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#586361",
    marginBottom: 3,
  },
  priceLabel: {
    fontSize: 12,
    color: "#687370",
    marginTop: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#246A59",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "flex-start",
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1D302C",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#687370",
  },
  resetButton: {
    minHeight: 44,
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 14,
    backgroundColor: "#246A59",
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
