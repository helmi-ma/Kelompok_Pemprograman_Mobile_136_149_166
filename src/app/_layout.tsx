
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

export const unstable_settings = {
  anchor: "(auth)/login",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
        <Stack.Screen
          name="(auth)/login"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(auth)/register"
          options={{ headerShown: false }}
        />

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
      </Stack>
    </ThemeProvider>
  );
}
