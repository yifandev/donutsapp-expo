import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function Layout() {
  return (
    <>
      <StatusBar style="inverted" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
        <Stack.Screen
          name="(stack)/locations"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="(stack)/edit-profile"
          options={{ animation: "slide_from_right" }}
        />
      </Stack>
    </>
  );
}
