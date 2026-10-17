import { router, useLocalSearchParams } from "expo-router";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DetailScreen() {
  const insets = useSafeAreaInsets();

  const { id, nama, kategori, rating, harga, jamBuka, lokasi, gambar } =
    useLocalSearchParams<{
      id: string;
      nama: string;
      kategori: string;
      rating: string;
      harga: string;
      jamBuka: string;
      lokasi: string;
      gambar: string;
    }>();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>‹ Kembali</Text>
      </TouchableOpacity>

      {gambar ? (
        <Image
          source={{ uri: gambar }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.content}>
        <Text style={styles.category}>{kategori}</Text>
        <Text style={styles.title}>{nama}</Text>

        <Text style={styles.rating}>⭐ Rating: {rating}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Harga</Text>
          <Text style={styles.value}>{harga}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Jam Buka</Text>
          <Text style={styles.value}>{jamBuka}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Lokasi</Text>
          <Text style={styles.value}>{lokasi}</Text>
        </View>

        <Text style={styles.idText}>ID Tempat: {id}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  backButton: {
    alignSelf: "flex-start",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  backButtonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 240,
    backgroundColor: "#E2E8F0",
  },
  content: {
    padding: 20,
  },
  category: {
    color: "#0D9488",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  title: {
    color: "#0F172A",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  rating: {
    color: "#334155",
    fontSize: 16,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "500",
  },
  idText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 8,
  },
});
