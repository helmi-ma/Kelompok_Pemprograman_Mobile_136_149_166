import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TempatNongkrong } from '../types/nongkrong';

// Data Dummy Tempat Nongkrong
const DATA_NONGKRONG: TempatNongkrong[] = [
  {
    id: '1',
    nama: 'Senja Coffee & Space',
    kategori: 'Workspace',
    rating: 4.8,
    harga: 'Rp 18.000 - Rp 45.000',
    jamBuka: '08.00 - 23.00',
    lokasi: 'Lowokwaru, Malang',
    gambar: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
  },
  {
    id: '2',
    nama: 'Kopi Tepi Jalan',
    kategori: 'Outdoor',
    rating: 4.6,
    harga: 'Rp 12.000 - Rp 30.000',
    jamBuka: '15.00 - 01.00',
    lokasi: 'Sukun, Malang',
    gambar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
  },
  {
    id: '3',
    nama: 'Skyline Rooftop & Eatery',
    kategori: 'Rooftop',
    rating: 4.9,
    harga: 'Rp 25.000 - Rp 85.000',
    jamBuka: '16.00 - 24.00',
    lokasi: 'Klojen, Malang',
    gambar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
  },
  {
    id: '4',
    nama: 'Rustic Artisan Cafe',
    kategori: 'Kafe',
    rating: 4.7,
    harga: 'Rp 20.000 - Rp 50.000',
    jamBuka: '09.00 - 22.00',
    lokasi: 'Blimbing, Malang',
    gambar: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500',
  },
];

const KATEGORI_LIST = ['Semua', 'Kafe', 'Workspace', 'Outdoor', 'Rooftop'];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriTerpilih, setKategoriTerpilih] = useState('Semua');

  // Filter Data berdasarkan Pencarian & Kategori
  const filteredData = DATA_NONGKRONG.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori =
      kategoriTerpilih === 'Semua' || item.kategori === kategoriTerpilih;
    return matchSearch && matchKategori;
  });

  const renderCard = ({ item }: { item: TempatNongkrong }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image source={{ uri: item.gambar }} style={styles.cardImage} />
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.nama}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        </View>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{item.kategori}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>📍 {item.lokasi}</Text>
          <Text style={styles.infoText}>⏰ {item.jamBuka}</Text>
        </View>

        <Text style={styles.priceText}>💰 {item.harga}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Aplikasi */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Temukan tempat Nongkrong asik di sekitarmu ☕</Text>
        <Text style={styles.headerTitle}>Nongkrongyuk</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari kafe, workspace, atau lokasi..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Kategori Horizontal */}
      <View style={{ maxHeight: 45, marginBottom: 12 }}>
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

      {/* List Tempat Nongkrong */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tempat nongkrong tidak ditemukan 🧐</Text>
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#4A3E3D',
  },
  categoryText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: '#FFF3BF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D9480F',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7F5FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    color: '#1C7ED6',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6C757D',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2B8A3E',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#868E96',
  },
});