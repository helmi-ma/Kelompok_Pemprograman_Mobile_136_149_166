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

export interface Spot {
  id: string;
  user_id: string;
  name: string;
  category: string;
  location: string | null;
  rating: number;
  created_at: string;
}

export default function MySpotsScreen() {
  const router = useRouter();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Kafe");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. SELECT: Ambil 50 data terbaru milik user yang login (aman untuk 100rb baris + RLS)
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
      Alert.alert("Gagal Memuat Data", error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  // 2. INSERT: Simpan tempat nongkrong baru ke Supabase
  const handleAddSpot = async () => {
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Akses Ditolak", "Silakan login terlebih dahulu.");
        return;
      }

      const { data, error } = await supabase
        .from("spots")
        .insert([
          {
            name: name.trim(),
            category: category.trim() || "Kafe",
            location: location.trim() || null,
            user_id: user.id,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        setSpots((prev) => [data[0], ...prev]);
        setName("");
        setLocation("");
      }
    } catch (error: any) {
      Alert.alert("Gagal Menyimpan", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. DELETE: Optimistic UI (hapus langsung di layar, rollback jika server gagal)
  const handleDeleteSpot = async (id: string) => {
    const previousSpots = [...spots];
    setSpots((prev) => prev.filter((item) => item.id !== id));

    const { error } = await supabase.from("spots").delete().eq("id", id);

    if (error) {
      setSpots(previousSpots);
      Alert.alert("Gagal Menghapus", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catatan Nongkrongku</Text>
      </View>

      {/* Form Tambah Tempat */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Tambah Tempat Favorit (Cloud)</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama tempat (mis. Kopi Tuku)"
          placeholderTextColor="#727A7C"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Kategori (Kafe/Outdoor)"
            placeholderTextColor="#727A7C"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Lokasi (Lowokwaru)"
            placeholderTextColor="#727A7C"
            value={location}
            onChangeText={setLocation}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddSpot}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.addBtnText}>+ Simpan ke Cloud</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Daftar Tempat Tersimpan */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#246A59" />
          <Text style={styles.loadingText}>Memuat catatan dari Supabase...</Text>
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
              Belum ada tempat nongkrong tersimpan di akun ini.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.spotName}>{item.name}</Text>
                <Text style={styles.spotMeta}>
                  {item.category} {item.location ? `• ${item.location}` : ""}
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
  container: { flex: 1, backgroundColor: "#F4F7F6" },
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
  backBtnText: { color: "#246A59", fontWeight: "700", fontSize: 13 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1D302C" },
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
  formTitle: { fontSize: 15, fontWeight: "700", color: "#1D302C" },
  row: { flexDirection: "row", gap: 10 },
  input: {
    backgroundColor: "#F4F7F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#DCE5E1",
    color: "#1D302C",
  },
  addBtn: {
    backgroundColor: "#246A59",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  listContainer: { paddingHorizontal: 22, paddingBottom: 28 },
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
  spotName: { fontSize: 16, fontWeight: "700", color: "#1D302C" },
  spotMeta: { fontSize: 13, color: "#586361", marginTop: 4 },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  deleteText: { color: "#DC2626", fontWeight: "700", fontSize: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#586361" },
  emptyText: { textAlign: "center", color: "#687370", marginTop: 40 },
});