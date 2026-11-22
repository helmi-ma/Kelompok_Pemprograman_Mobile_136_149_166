
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { supabase } from "@/lib/supabase";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Mencegah double submit
    if (isLoading) return;

    // Membersihkan input
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Validasi input kosong
    if (
      !cleanUsername ||
      !cleanEmail ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Peringatan", "Semua kolom wajib diisi.");
      return;
    }

    // Validasi username
    if (cleanUsername.length < 3) {
      Alert.alert(
        "Peringatan",
        "Username minimal terdiri dari 3 karakter."
      );
      return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      Alert.alert("Peringatan", "Format email tidak valid.");
      return;
    }

    // Validasi password
    if (password.length < 6) {
      Alert.alert(
        "Peringatan",
        "Password minimal terdiri dari 6 karakter."
      );
      return;
    }

    // Validasi konfirmasi password
    if (password !== confirmPassword) {
      Alert.alert(
        "Peringatan",
        "Konfirmasi password tidak cocok."
      );
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            username: cleanUsername,
          },
        },
      });

      if (error) {
        Alert.alert("Registrasi Gagal", error.message);
        return;
      }

      if (data.session) {
        Alert.alert(
          "Registrasi Berhasil",
          "Akun berhasil dibuat. Selamat datang di Nongkrongyuk!"
        );

        router.replace("/");
      } else {
        Alert.alert(
          "Registrasi Berhasil",
          "Silakan login menggunakan akun yang sudah dibuat.",
          [
            {
              text: "Login",
              onPress: () => router.replace("/(auth)/login"),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        "Terjadi Kesalahan",
        "Tidak dapat menghubungkan ke server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>Nongkrongyuk ☕</Text>
            <Text style={styles.subtitle}>
              Bergabung dan temukan tempat nongkrong favoritmu.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Buat Akun</Text>
            <Text style={styles.description}>
              Lengkapi data berikut untuk mendaftar.
            </Text>

            <Text style={styles.label}>Username / Callsign</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan username"
              placeholderTextColor="#929A97"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan email"
              placeholderTextColor="#929A97"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#929A97"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Text style={styles.showPassword}>
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Konfirmasi Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Ulangi password"
              placeholderTextColor="#929A97"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>
                  Daftar Sekarang
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Sudah punya akun?
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/login")}
                disabled={isLoading}
              >
                <Text style={styles.loginLink}> Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F6",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#246A59",
  },
  subtitle: {
    fontSize: 13,
    color: "#687370",
    marginTop: 8,
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E7E3",
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#1D302C",
  },
  description: {
    fontSize: 14,
    color: "#687370",
    marginTop: 7,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#35413E",
    marginBottom: 8,
    marginTop: 13,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DCE5E1",
    borderRadius: 9,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1D302C",
    backgroundColor: "#FFFFFF",
  },
  passwordContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE5E1",
    borderRadius: 9,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: "#1D302C",
  },
  showPassword: {
    color: "#246A59",
    fontSize: 12,
    fontWeight: "700",
  },
  registerButton: {
    height: 52,
    backgroundColor: "#246A59",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  disabledButton: {
    opacity: 0.65,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
    flexWrap: "wrap",
  },
  loginText: {
    fontSize: 13,
    color: "#687370",
  },
  loginLink: {
    fontSize: 13,
    color: "#246A59",
    fontWeight: "700",
  },
});
