import { authClient } from "@/lib/auth-client";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import "../global.css";

SplashScreen.setOptions({
  duration: 800,
  fade: true,
});
SplashScreen.preventAutoHideAsync();

export function Navigations() {
  const [appReady, setAppReady] = useState(false);
  const { data: session } = authClient.useSession();

  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/font/Poppins/Poppins-Regular.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // simulasi preload data / api / async storage
        // await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [appReady, fontsLoaded]);

  if (!appReady || !fontsLoaded) {
    return (
      <>
        <View className="flex-1 bg-text-primary items-center justify-center">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        {/* PUBLIC ROUTES: hanya bisa diakses jika BELUM login */}
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(public)" options={{ headerShown: false }} />
        </Stack.Protected>
        {/* PROTECTED ROUTES: hanya bisa diakses jika SUDAH login */}
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="user" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <Navigations />
    </KeyboardProvider>
  );
}
