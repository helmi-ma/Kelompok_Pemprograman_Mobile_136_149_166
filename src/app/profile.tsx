
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Mengambil data pengguna yang sedang login
  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          router.replace("/(auth)/login");
          return;
        }

        setUser(data.user);
      } catch {
        Alert.alert("Error", "Gagal mengambil data profil.");
      } finally {
        setIsLoading(false);
      }
    };

    getProfile();
  }, []);

  // Fungsi Logout
  const handleLogout = async () => {
    if (isLoggingOut) return;

    Alert.alert(
      "Konfirmasi Logout",
      "Apakah kamu yakin ingin keluar dari akun?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true);

              const { error } = await supabase.auth.signOut();

              if (error) {
                Alert.alert("Logout Gagal", error.message);
                return;
              }

              router.replace("/(auth)/login");
            } catch {
              Alert.alert("Error", "Gagal melakukan logout.");
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#246A59" />
        <Text style={styles.loadingText}>Memuat profil...</Text>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  const username =
    user.user_metadata?.username || "Pengguna";

  const email = user.email || "-";

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Profil Saya</Text>
        <Text style={styles.pageSubtitle}>
          Informasi akun Nongkrongyuk kamu
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.username}>{username}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>
              Anggota Nongkrongyuk
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            Informasi Akun
          </Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{username}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tanggal Bergabung</Text>
            <Text style={styles.infoValue}>{createdAt}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.userId}>{user.id}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLoggingOut && styles.disabledButton,
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.8}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutButtonText}>
              Keluar dari Akun
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>
          Nongkrongyuk © 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7F6",
  },
  loadingText: {
    marginTop: 12,
    color: "#687370",
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#1D302C",
  },
  pageSubtitle: {
    color: "#687370",
    marginTop: 5,
    marginBottom: 25,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E7E3",
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 50,
    backgroundColor: "#246A59",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  username: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1D302C",
  },
  email: {
    fontSize: 14,
    color: "#687370",
    marginTop: 5,
  },
  memberBadge: {
    backgroundColor: "#E6F2EE",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 15,
  },
  memberBadgeText: {
    color: "#246A59",
    fontSize: 12,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E0E7E3",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1D302C",
    marginBottom: 15,
  },
  infoItem: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#82908B",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#263B35",
  },
  userId: {
    fontSize: 11,
    color: "#263B35",
  },
  separator: {
    height: 1,
    backgroundColor: "#EDF1EF",
  },
  logoutButton: {
    height: 52,
    backgroundColor: "#D94B4B",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  disabledButton: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    color: "#929A97",
    fontSize: 12,
    marginTop: 25,
  },
});
