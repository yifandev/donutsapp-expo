import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function PublicLayout() {
  const router = useRouter();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="(auth)/sign-in"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.7],
          title: "",
          headerShadowVisible: false,
          sheetCornerRadius: 16,
          sheetGrabberVisible: true,
          headerRight: () => (
            <TouchableOpacity
              style={{
                padding: 4,
                borderRadius: 20,
              }}
              onPress={() => router.dismiss()}
            >
              <Ionicons name="close-sharp" size={28} />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="(auth)/verify-email"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.7],
          title: "",
          headerShadowVisible: false,
          sheetCornerRadius: 16,
          sheetGrabberVisible: true,
          headerRight: () => (
            <TouchableOpacity
              style={{
                padding: 4,
                borderRadius: 20,
              }}
              onPress={() => router.dismiss()}
            >
              <Ionicons name="close-sharp" size={28} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
