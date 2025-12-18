import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

/* =======================
   TYPES
======================= */
type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  subtitle?: string;
};

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  label: string;
  isDefault: boolean;
}

interface LocationObjectType {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface LocationResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export default function LocationsScreen() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [mapModules, setMapModules] = useState<{
    AppleMaps?: any;
    GoogleMaps?: any;
  }>({});

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<LocationObjectType | null>(null);

  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("Home");
  const [isDefault, setIsDefault] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  /* =======================
     GET CURRENT LOCATION
  ======================= */
  useEffect(() => {
    if (!session?.user?.id) return;

    const init = async () => {
      try {
        // Lazy-load expo-location
        const expoLocation = await import("expo-location");
        const {
          requestForegroundPermissionsAsync,
          getCurrentPositionAsync,
          reverseGeocodeAsync,
        } = expoLocation;

        const { status } = await requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Location Permission Required",
            "We need access to your location to save your favorite pickup spots and provide accurate delivery options.",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => router.back(),
              },
              {
                text: "Open Settings",
                style: "default",
                onPress: () =>
                  expoLocation
                    .getProviderStatusAsync()
                    .then(() => expoLocation.enableNetworkProviderAsync()),
              },
            ]
          );
          return;
        }

        const location = await getCurrentPositionAsync({
          accuracy: expoLocation.Accuracy.High,
        });
        setCurrentLocation(location);

        const reverse = await reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const fullAddress = reverse[0]
          ? [
              reverse[0].street,
              reverse[0].city,
              reverse[0].region,
              reverse[0].postalCode,
              reverse[0].country,
            ]
              .filter(Boolean)
              .join(", ")
          : "Current Location";

        setAddress(fullAddress);

        setMarkers([
          {
            id: "current-location",
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            title: "Your Location",
            subtitle: fullAddress,
          },
        ]);

        // Lazy-load maps
        try {
          const maps: any = await import("expo-maps");
          setMapModules({
            AppleMaps: maps.AppleMaps,
            GoogleMaps: maps.GoogleMaps,
          });
        } catch (e) {
          console.warn("Maps module not available:", e);
        }
      } catch (error) {
        console.error("Location error:", error);
        Toast.show({
          type: "error",
          text1: "Location Error",
          text2: "Could not retrieve your location. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [session?.user?.id]);

  /* =======================
   SAVE LOCATION - SESUAI DOCS BETTER AUTH EXPO
======================= */
  const handleSaveLocation = async () => {
    if (!currentLocation || !address.trim()) {
      Toast.show({
        type: "error",
        text1: "Address Required",
        text2: "Please enter a valid address",
      });
      return;
    }

    try {
      setSaveLoading(true);

      // SESUAI DOCS BETTER AUTH: Ambil cookies dari authClient
      const cookies = authClient.getCookie();

      if (!cookies) {
        throw new Error("No session found. Please sign in again.");
      }

      const payload: LocationData = {
        address: address.trim(),
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        label: label || "Home",
        isDefault,
      };

      // SESUAI DOCS BETTER AUTH: Gunakan cookies di headers
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Kirim cookies sesuai dokumentasi Better Auth
          Cookie: cookies,
        },
        credentials: "omit", // Penting: gunakan 'omit' karena cookies sudah dikirim manual
        body: JSON.stringify(payload),
      });

      const result: LocationResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Failed to save location: ${response.status}`
        );
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to save location");
      }

      Toast.show({
        type: "success",
        text1: "Location Saved",
        text2: result.message || "Your location has been saved successfully",
      });

      // Navigate back after successful save
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      console.error("Save location error:", error);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: error.message || "Could not save location. Please try again.",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  /* =======================
     MAP RENDERER
  ======================= */
  const renderMap = () => {
    if (!currentLocation) return null;

    const cameraPosition = {
      center: {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      },
      zoom: 16,
      heading: 0,
      pitch: 0,
    };

    // Map fallback UI
    const MapFallback = () => (
      <View className="flex-1 items-center justify-center bg-muted">
        <View className="w-20 h-20 items-center justify-center bg-primary rounded-2xl mb-4">
          <Ionicons name="map-outline" size={40} color="#EDECE3" />
        </View>
        <Text className="text-lg font-semibold text-primary mb-2">
          Map Preview
        </Text>
        <Text className="text-accent text-center px-8">
          Your location is ready to be saved. Map view requires additional
          setup.
        </Text>
      </View>
    );

    try {
      if (Platform.OS === "ios" && mapModules.AppleMaps) {
        const AppleMaps = mapModules.AppleMaps;
        return (
          <AppleMaps.View
            ref={mapRef}
            style={{ flex: 1 }}
            cameraPosition={cameraPosition}
            markers={markers}
            showsUserLocation={true}
            userInterfaceStyle="light"
          />
        );
      }

      if (Platform.OS === "android" && mapModules.GoogleMaps) {
        const GoogleMaps = mapModules.GoogleMaps;
        return (
          <GoogleMaps.View
            ref={mapRef}
            style={{ flex: 1 }}
            cameraPosition={cameraPosition}
            markers={markers}
            showsUserLocation={true}
          />
        );
      }

      return <MapFallback />;
    } catch (error) {
      return <MapFallback />;
    }
  };

  /* =======================
     LOADING STATE
  ======================= */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 items-center justify-center rounded-2xl mb-6">
            <ActivityIndicator size="large" color="#6D2F13" />
          </View>
          <Text className="text-2xl font-bold text-primary mb-2">
            Menemukan Lokasi Anda
          </Text>
          <Text className="text-accent text-center">
            Sedang mendapatkan posisi Anda saat ini...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================
     MAIN UI
  ======================= */
  return (
    <>
      <LinearGradient
        colors={["#6D2F13", "#C25322"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View className=" px-6 pt-6 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-white active:bg-muted"
            >
              <Ionicons name="chevron-back" size={24} color="#6D2F13" />
            </TouchableOpacity>

            <View className="items-center flex-1 px-4">
              <Text className="text-2xl font-bold text-white">
                Simpan Lokasi
              </Text>
              <Text className="text-white text-sm mt-1">
                Tambahkan lokasi penjemputan
              </Text>
            </View>

            <View className="w-10" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Map Section */}
        <View className="h-72 bg-muted">
          {renderMap()}
          <View className="absolute bottom-6 left-0 right-0 items-center">
            <View className="bg-primary px-4 py-3 rounded-full flex-row items-center shadow-hard ">
              <Ionicons name="location" size={20} color="#EDECE3" />
              <Text className="text-white font-semibold ml-2">
                Lokasi Anda Saat Ini
              </Text>
            </View>
          </View>
        </View>

        {/* Form Section */}
        <View className="flex-1 px-6 pt-8 pb-6 bg-gray-50">
          {/* Address Input */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 items-center justify-center  rounded-xl mr-3">
                <Ionicons name="home" size={22} color="#6D2F13" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-primary">
                  Detail Alamat
                </Text>
                <Text className="text-accent text-sm">
                  Alamat pengiriman lengkap
                </Text>
              </View>
            </View>

            <View className="bg-muted rounded-2xl p-4 shadow-soft border border-muted">
              <Text className="text-sm font-medium text-accent mb-2">
                Alamat Lengkap
              </Text>
              <TextInput
                className="text-primary text-base leading-6 min-h-[80px]"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Enter street address, city, and postal code"
                placeholderTextColor="#AE562F"
              />
            </View>
          </View>

          {/* Label Selection */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 items-center justify-center  rounded-xl mr-3">
                <Ionicons name="pricetag" size={22} color="#6D2F13" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-primary">
                  Label
                </Text>
                <Text className="text-accent text-sm">
                  Kategori lokasi Anda
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {[
                { label: "Home", icon: "home" },
                { label: "Work", icon: "briefcase" },
                { label: "Gym", icon: "fitness" },
                { label: "Other", icon: "location" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => setLabel(item.label)}
                  className={`flex-row items-center px-4 py-3 rounded-xl ${
                    label === item.label
                      ? "bg-primary border-2 border-primary"
                      : "bg-muted border-2 border-muted"
                  }`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={label === item.label ? "#EDECE3" : "#6D2F13"}
                  />
                  <Text
                    className={`font-medium ml-2 ${
                      label === item.label ? "text-white" : "text-primary"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Default Toggle */}
          <View className="mb-10">
            <TouchableOpacity
              onPress={() => setIsDefault(!isDefault)}
              className="flex-row items-center justify-between bg-muted rounded-2xl p-4 shadow-soft border border-muted"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 items-center justify-center bg-accent rounded-xl mr-3">
                  <Ionicons name="star-outline" size={22} color="#EDECE3" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-primary mb-1">
                    Tetapkan sebagai Lokasi Default
                  </Text>
                  <Text className="text-accent text-sm">
                    Gunakan ini sebagai titik penjemputan utama Anda untuk
                    pembayaran lebih cepat
                  </Text>
                </View>
              </View>

              <View
                className={`w-14 h-8 rounded-full p-1 ${isDefault ? "bg-primary" : "bg-secondary"}`}
              >
                <View
                  className={`w-6 h-6 rounded-full bg-white transform  ${isDefault ? "translate-x-6" : ""}`}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`rounded-2xl p-4 shadow-medium mb-6 ${
              saveLoading ? "bg-accent" : "bg-primary"
            }`}
            onPress={handleSaveLocation}
            disabled={saveLoading || !address.trim()}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              {saveLoading ? (
                <ActivityIndicator size="small" color="#EDECE3" />
              ) : (
                <Ionicons
                  name="save-outline"
                  size={24}
                  color="#EDECE3"
                  className="mr-3"
                />
              )}
              <Text className="text-white text-lg font-semibold">
                {saveLoading ? "Saving Location..." : "Save Location"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Info Text */}
          <View className="bg-primary rounded-2xl p-4 mb-10">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#EDECE3"
                className="mt-1"
              />
              <Text className="text-white text-sm ml-3 flex-1">
                Lokasi yang disimpan akan muncul saat checkout dan dapat
                dikelola di pengaturan profil Anda. Anda dapat memiliki beberapa
                lokasi dan memilih salah satunya sebagai default.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
