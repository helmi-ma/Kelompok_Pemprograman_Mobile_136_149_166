
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

interface Cafe {
  id: number;
  nama: string;
  kategori: string;
  rating: number | null;
  harga: string | null;
  jam_buka: string | null;
  lokasi: string | null;
  gambar: string | null;
}

interface Spot {
  id: string;
  user_id: string;
  cafe_id: number;
  name: string;
  category: string;
  location: string | null;
  rating: number;
  created_at: string;
}

export default function MySpotsScreen() {
  const router = useRouter();

  const [spots, setSpots] = useState<Spot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // AMBIL DAFTAR FAVORIT PENGGUNA
  const fetchSpots = async () => {
    try {
      const { data, error } = await supabase
        .from("spots")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setSpots(data || []);
    } catch (error: any) {
      Alert.alert("Gagal Memuat Favorit", error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  // AUTOCOMPLETE: CARI KAFE DARI TABEL CAFES
  useEffect(() => {
    let isActive = true;

    const keyword = searchQuery.trim();

    if (selectedCafe || keyword.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const searchTimer = setTimeout(async () => {
      try {
        setIsSearching(true);

        const { data, error } = await supabase
          .from("cafes")
          .select(
            "id, nama, kategori, rating, harga, jam_buka, lokasi, gambar"
          )
          .ilike("nama", `${keyword}%`)
          .order("nama", { ascending: true })
          .limit(10);

        if (error) throw error;

        if (isActive) {
          setSuggestions(data || []);
        }
      } catch (error: any) {
        console.error("Gagal mencari kafe:", error.message);

        if (isActive) {
          setSuggestions([]);
        }
      } finally {
        if (isActive) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(searchTimer);
    };
  }, [searchQuery, selectedCafe]);

  // PILIH KAFE DARI SARAN
  const handleSelectCafe = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setSearchQuery(cafe.nama);
    setSuggestions([]);
  };

  // SIMPAN KAFE KE FAVORIT
  const handleAddFavorite = async () => {
    if (!selectedCafe || submitting) return;

    setSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        Alert.alert("Akses Ditolak", "Silakan login terlebih dahulu.");
        return;
      }

      // CEK APAKAH KAFE SUDAH ADA DI FAVORIT
      const alreadyFavorite = spots.some(
        (item) => item.cafe_id === selectedCafe.id
      );

      if (alreadyFavorite) {
        Alert.alert(
          "Sudah Favorit",
          "Kafe ini sudah ada di daftar favorit kamu."
        );
        return;
      }

      const { data, error } = await supabase
        .from("spots")
        .insert({
          user_id: user.id,
          cafe_id: selectedCafe.id,
          name: selectedCafe.nama,
          category: selectedCafe.kategori,
          location: selectedCafe.lokasi,
          rating: Math.round(Number(selectedCafe.rating ?? 0)),
        })
        .select()
        .single();

      if (error) throw error;

      setSpots((prev) => [data, ...prev]);

      setSearchQuery("");
      setSelectedCafe(null);
      setSuggestions([]);

      Alert.alert(
        "Berhasil",
        `${selectedCafe.nama} berhasil ditambahkan ke favorit.`
      );
    } catch (error: any) {
      Alert.alert("Gagal Menyimpan", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // HAPUS FAVORIT
  const handleDeleteSpot = (id: string) => {
    Alert.alert(
      "Hapus Favorit",
      "Yakin ingin menghapus kafe ini dari favorit?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            const previousSpots = [...spots];

            setSpots((prev) =>
              prev.filter((item) => item.id !== id)
            );

            const { error } = await supabase
              .from("spots")
              .delete()
              .eq("id", id);

            if (error) {
              setSpots(previousSpots);
              Alert.alert("Gagal Menghapus", error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Kembali</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Favorit Saya</Text>
      </View>

      {/* FORM PENCARIAN KAFE */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          Tambahkan Kafe ke Favorit
        </Text>

        <Text style={styles.formHint}>
          Ketik minimal 2 huruf untuk mencari nama kafe.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Cari nama kafe, misalnya: na"
          placeholderTextColor="#727A7C"
          value={searchQuery}
          onChangeText={(value) => {
            setSearchQuery(value);
            setSelectedCafe(null);
          }}
          autoCorrect={false}
        />

        {/* LOADING PENCARIAN */}
        {isSearching && (
          <View style={styles.searchLoading}>
            <ActivityIndicator color="#246A59" size="small" />
            <Text style={styles.hintText}>Mencari kafe...</Text>
          </View>
        )}

        {/* HASIL AUTOCOMPLETE */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            {suggestions.map((cafe) => (
              <TouchableOpacity
                key={cafe.id}
                style={styles.suggestionItem}
                onPress={() => handleSelectCafe(cafe)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionName}>
                    {cafe.nama}
                  </Text>

                  <Text style={styles.suggestionMeta}>
                    {cafe.kategori}
                    {cafe.lokasi ? ` • ${cafe.lokasi}` : ""}
                  </Text>
                </View>

                <Text style={styles.chooseText}>Pilih</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TIDAK ADA HASIL */}
        {!isSearching &&
          searchQuery.trim().length >= 2 &&
          !selectedCafe &&
          suggestions.length === 0 && (
            <Text style={styles.hintText}>
              Tidak ada kafe yang cocok. Coba nama lain.
            </Text>
          )}

        {/* KAFE TERPILIH */}
        {selectedCafe && (
          <View style={styles.selectedBox}>
            <Text style={styles.selectedLabel}>
              Kafe yang dipilih:
            </Text>

            <Text style={styles.selectedName}>
              ✓ {selectedCafe.nama}
            </Text>

            <Text style={styles.selectedMeta}>
              {selectedCafe.kategori}
              {selectedCafe.lokasi
                ? ` • ${selectedCafe.lokasi}`
                : ""}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setSelectedCafe(null);
                setSearchQuery("");
              }}
            >
              <Text style={styles.changeText}>
                Ganti pilihan
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.addBtn,
            (!selectedCafe || submitting) && styles.disabledBtn,
          ]}
          onPress={handleAddFavorite}
          disabled={!selectedCafe || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.addBtnText}>
              + Tambahkan ke Favorit
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* DAFTAR FAVORIT */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Daftar Favorit</Text>
        <Text style={styles.countText}>
          {spots.length} kafe
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#246A59" />
          <Text style={styles.loadingText}>
            Memuat daftar favorit...
          </Text>
        </View>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              colors={["#246A59"]}
              onRefresh={() => {
                setRefreshing(true);
                fetchSpots();
              }}
            />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Belum ada kafe favorit. Cari dan tambahkan kafe
              kesukaanmu!
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.spotName}>
                  {item.name}
                </Text>

                <Text style={styles.spotMeta}>
                  {item.category}
                  {item.location ? ` • ${item.location}` : ""}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDeleteSpot(item.id)}
                style={styles.deleteBtn}
              >
                <Text style={styles.deleteText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          )}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: {
    backgroundColor: "#E6F2EE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#246A59",
    fontWeight: "700",
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1D302C",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 22,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E7E3",
    marginBottom: 16,
    gap: 10,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1D302C",
  },
  formHint: {
    fontSize: 13,
    color: "#687370",
  },
  input: {
    backgroundColor: "#F4F7F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#DCE5E1",
    color: "#1D302C",
  },
  searchLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hintText: {
    fontSize: 13,
    color: "#687370",
    marginTop: 4,
  },
  suggestionBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5E1",
    borderRadius: 8,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1EF",
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D302C",
  },
  suggestionMeta: {
    fontSize: 12,
    color: "#687370",
    marginTop: 4,
  },
  chooseText: {
    color: "#246A59",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 10,
  },
  selectedBox: {
    backgroundColor: "#E6F2EE",
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  selectedLabel: {
    color: "#586361",
    fontSize: 12,
  },
  selectedName: {
    color: "#246A59",
    fontSize: 15,
    fontWeight: "800",
  },
  selectedMeta: {
    color: "#586361",
    fontSize: 12,
  },
  changeText: {
    color: "#246A59",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  addBtn: {
    backgroundColor: "#246A59",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledBtn: {
    backgroundColor: "#9AAFA8",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1D302C",
  },
  countText: {
    fontSize: 13,
    color: "#687370",
  },
  listContainer: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E7E3",
  },
  spotName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D302C",
  },
  spotMeta: {
    fontSize: 13,
    color: "#586361",
    marginTop: 4,
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  deleteText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#586361",
  },
  emptyText: {
    textAlign: "center",
    color: "#687370",
    marginTop: 35,
    paddingHorizontal: 30,
  },
});
