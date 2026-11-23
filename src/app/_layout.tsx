import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/context/AuthContext";

export const unstable_settings = {
  anchor: "(auth)/login",
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Tunggu sampai pengecekan sesi di SecureStore selesai
    if (isLoading) return;

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Belum login tapi mencoba akses halaman utama -> lempar ke login
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Sudah login tapi berada di halaman login/register -> arahkan ke home
      router.replace("/");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F4F7F6",
        }}
      >
        <ActivityIndicator size="large" color="#246A59" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#246A59",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />

        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />

        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="explore"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="detail"
          options={{
            headerShown: true,
            title: "Detail Cafe",
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen
          name="my-spots"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
