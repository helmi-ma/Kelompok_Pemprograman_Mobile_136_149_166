
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Mencegah double submit
    if (isLoading) return;

    // Validasi input kosong
    if (!email.trim() || !password.trim()) {
      Alert.alert("Peringatan", "Email dan password wajib diisi.");
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert("Peringatan", "Format email tidak valid.");
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        Alert.alert("Login Gagal", error.message);
        return;
      }

      Alert.alert("Berhasil", "Selamat datang di Nongkrongyuk!");

      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Terjadi Kesalahan",
        "Tidak dapat menghubungkan ke server. Coba lagi."
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
              Temukan tempat nongkrong favoritmu di Malang.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Selamat Datang!</Text>
            <Text style={styles.description}>
              Silakan login untuk melanjutkan.
            </Text>

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
                placeholder="Masukkan password"
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

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Belum punya akun?
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/(auth)/register")}
                disabled={isLoading}
              >
                <Text style={styles.registerLink}> Daftar sekarang</Text>
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
    paddingVertical: 35,
  },
  header: {
    alignItems: "center",
    marginBottom: 35,
  },
  logo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#246A59",
  },
  subtitle: {
    fontSize: 14,
    color: "#687370",
    marginTop: 9,
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
    marginBottom: 27,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#35413E",
    marginBottom: 8,
    marginTop: 15,
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
  loginButton: {
    height: 52,
    backgroundColor: "#246A59",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  disabledButton: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 23,
    flexWrap: "wrap",
  },
  registerText: {
    fontSize: 13,
    color: "#687370",
  },
  registerLink: {
    fontSize: 13,
    color: "#246A59",
    fontWeight: "700",
  },
});
