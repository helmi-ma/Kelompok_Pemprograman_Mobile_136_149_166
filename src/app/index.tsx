import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import { supabase } from "@/lib/supabase";
import { getPlacesFromSupabase } from "@/services/nongkrongService";
import { TempatNongkrong } from "@/types/nongkrong";

const KATEGORI_LIST = ["Semua", "Kafe", "Workspace", "Outdoor", "Rooftop"];
const ITEMS_PER_PAGE = 10;

export default function HomeScreen() {
  const [dataNongkrong, setDataNongkrong] = useState<TempatNongkrong[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriTerpilih, setKategoriTerpilih] = useState("Semua");
  const [searchVisible, setSearchVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const loadFavorites = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("spots")
      .select("name")
      .eq("user_id", user.id);

    if (data) {
      setFavoriteNames(data.map((item) => item.name));
    }
  };

  const loadData = async (page: number = currentPage) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getPlacesFromSupabase(
        page,
        ITEMS_PER_PAGE,
        searchQuery,
        kategoriTerpilih
      );
      setDataNongkrong(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.total);
      setCurrentPage(result.page);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Terjadi kesalahan saat memuat data dari Supabase."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    loadData(1);
  }, [searchQuery, kategoriTerpilih]);

  const handleToggleFavorite = async (item: TempatNongkrong) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Info", "Silakan login terlebih dahulu untuk menyimpan favorit.");
      return;
    }

    const isAlreadyFav = favoriteNames.includes(item.nama);

    if (isAlreadyFav) {
      setFavoriteNames((prev) => prev.filter((name) => name !== item.nama));
      const { error } = await supabase
        .from("spots")
        .delete()
        .eq("user_id", user.id)
        .eq("name", item.nama);

      if (error) {
        setFavoriteNames((prev) => [...prev, item.nama]);
        Alert.alert("Gagal Menghapus Favorit", error.message);
      }
    } else {
      setFavoriteNames((prev) => [...prev, item.nama]);
      const { error } = await supabase.from("spots").insert([
        {
          name: item.nama,
          category: item.kategori,
          location: item.lokasi,
          rating: Math.round(Number(item.rating)) || 5,
          user_id: user.id,
        },
      ]);

      if (error) {
        setFavoriteNames((prev) => prev.filter((name) => name !== item.nama));
        Alert.alert("Gagal Menyimpan Favorit", error.message);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      loadData(newPage);
    }
  };

  // Generate array nomor halaman yang ditampilkan
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        start = 1;
        end = maxVisible;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - (maxVisible - 1);
        end = totalPages;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const renderPagination = () => {
    if (totalPages <= 1 && dataNongkrong.length === 0) return null;

    const pageNumbers = getPageNumbers();

    return (
      <View style={styles.paginationContainer}>
        {/* Tombol Sebelumnya */}
        <TouchableOpacity
          style={[
            styles.pageNavButton,
            currentPage === 1 && styles.pageNavButtonDisabled,
          ]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.pageNavButtonText,
              currentPage === 1 && styles.pageNavButtonTextDisabled,
            ]}
          >
            ‹ Prev
          </Text>
        </TouchableOpacity>

        {/* Nomor Halaman */}
        <View style={styles.pageNumbersContainer}>
          {pageNumbers.map((p, index) => {
            if (typeof p === "string") {
              return (
                <View key={`ellipsis-${index}`} style={styles.pageEllipsis}>
                  <Text style={styles.pageEllipsisText}>{p}</Text>
                </View>
              );
            }

            const isActive = p === currentPage;
            return (
              <TouchableOpacity
                key={`page-${p}`}
                style={[styles.pageNumberBtn, isActive && styles.pageNumberBtnActive]}
                onPress={() => handlePageChange(p)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pageNumberText,
                    isActive && styles.pageNumberTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tombol Selanjutnya */}
        <TouchableOpacity
          style={[
            styles.pageNavButton,
            currentPage === totalPages && styles.pageNavButtonDisabled,
          ]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.pageNavButtonText,
              currentPage === totalPages && styles.pageNavButtonTextDisabled,
            ]}
          >
            Next ›
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCard = ({ item }: { item: TempatNongkrong }) => {
    const isFav = favoriteNames.includes(item.nama);

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <Image source={{ uri: item.gambar }} style={styles.cardImage} />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.nama}</Text>

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>★ {item.rating}</Text>
            </View>
          </View>

          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.kategori}</Text>
          </View>

          <Text style={styles.infoText}>Lokasi: {item.lokasi}</Text>
          <Text style={styles.infoText}>Jam buka: {item.jamBuka}</Text>

          <Text style={styles.priceLabel}>Kisaran harga</Text>
          <Text style={styles.priceText}>{item.harga}</Text>

          {/* Baris Tombol Lihat Detail + Favorit */}
          <View style={styles.cardActionRow}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() =>
                router.push({
                  pathname: "/detail",
                  params: {
                    id: item.id,
                    nama: item.nama,
                    kategori: item.kategori,
                    rating: String(item.rating),
                    harga: item.harga,
                    jamBuka: item.jamBuka,
                    lokasi: item.lokasi,
                    gambar: item.gambar,
                  },
                })
              }
            >
              <Text style={styles.detailButtonText}>Lihat Detail</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.favButton, isFav && styles.favButtonActive]}
              onPress={() => handleToggleFavorite(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.favButtonText, isFav && styles.favButtonTextActive]}>
                {isFav ? "♥" : "♡"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Nongkrongyuk</Text>

          <View style={styles.headerActions}>
            {/* Tombol Pencarian */}
            <TouchableOpacity
              style={styles.searchToggle}
              onPress={() => {
                setSearchVisible(!searchVisible);
                setMenuVisible(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.searchToggleText}>
                {searchVisible ? "✕" : "⌕"}
              </Text>
            </TouchableOpacity>

            {/* Tombol Hamburger */}
            <TouchableOpacity
              style={styles.menuToggle}
              onPress={() => {
                setMenuVisible(!menuVisible);
                setSearchVisible(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.menuToggleText}>
                {menuVisible ? "✕" : "☰"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown Menu */}
        {menuVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                router.push("/profile");
              }}
            >
              <Text style={styles.dropdownIcon}>👤</Text>
              <Text style={styles.dropdownText}>Profil Saya</Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownItem}
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                router.push("/my-spots");
              }}
            >
              <Text style={styles.dropdownIcon}>★</Text>
              <Text style={styles.dropdownText}>Favorit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bagian Pencarian */}
      {searchVisible && (
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
      )}

      {/* Bagian Kategori */}
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

      {/* Loading */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#246A59" />
          <Text style={styles.loadingText}>Mengambil data dari Supabase...</Text>
        </View>
      ) : errorMessage ? (
        /* Error */
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>Gagal Memuat Data</Text>
          <Text style={styles.emptyText}>{errorMessage}</Text>

          <TouchableOpacity style={styles.resetButton} onPress={() => loadData(currentPage)}>
            <Text style={styles.resetButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Daftar Tempat Nongkrong */
        <FlatList
          data={dataNongkrong}
          onScroll={(event) => {
            if (event.nativeEvent.contentOffset.y > 10) {
              setSearchVisible(false);
              setMenuVisible(false);
            }
          }}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultCount}>
                {totalItems} tempat ditemukan
              </Text>
              {totalPages > 1 && (
                <Text style={styles.pageInfoText}>
                  Halaman {currentPage} dari {totalPages}
                </Text>
              )}
            </View>
          }
          ListFooterComponent={renderPagination}
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
              >
                <Text style={styles.resetButtonText}>
                  Tampilkan semua tempat
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F6",
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 18,
    position: "relative",
    zIndex: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },

  headerTitle: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "800",
    color: "#1D302C",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchToggle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#246A59",
    alignItems: "center",
    justifyContent: "center",
  },

  searchToggleText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
  },

  menuToggle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#246A59",
    alignItems: "center",
    justifyContent: "center",
  },

  menuToggleText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
  },

  dropdownMenu: {
    position: "absolute",
    top: 65,
    right: 22,
    width: 185,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 100,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 15,
  },

  dropdownIcon: {
    fontSize: 17,
    width: 30,
  },

  dropdownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D302C",
  },

  dropdownDivider: {
    height: 1,
    backgroundColor: "#EDF1EF",
    marginHorizontal: 12,
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
  },

  resultHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  pageInfoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#246A59",
  },

  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },

  pageNumbersContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  pageNumberBtn: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCE5E1",
    paddingHorizontal: 8,
  },

  pageNumberBtnActive: {
    backgroundColor: "#246A59",
    borderColor: "#246A59",
  },

  pageNumberText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1D302C",
  },

  pageNumberTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  pageEllipsis: {
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  pageEllipsisText: {
    fontSize: 13,
    color: "#687370",
  },

  pageNavButton: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E6F2EE",
    alignItems: "center",
    justifyContent: "center",
  },

  pageNavButtonDisabled: {
    backgroundColor: "#EDF1EF",
    opacity: 0.5,
  },

  pageNavButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#246A59",
  },

  pageNavButtonTextDisabled: {
    color: "#9EABA6",
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

  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },

  detailButton: {
    flex: 1,
    backgroundColor: "#246A59",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  detailButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  favButton: {
    width: 44,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E6F2EE",
    borderWidth: 1,
    borderColor: "#246A59",
    alignItems: "center",
    justifyContent: "center",
  },

  favButtonActive: {
    backgroundColor: "#FEE2E2",
    borderColor: "#DC2626",
  },

  favButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#246A59",
  },

  favButtonTextActive: {
    color: "#DC2626",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#586361",
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