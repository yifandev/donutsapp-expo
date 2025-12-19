import { useLocations } from "@/hooks/useLocations";
import { authClient } from "@/lib/auth-client";
import { Location } from "@/utils/address-helpers";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

/* ========================
   TYPES & CONSTANTS
======================== */
type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  subtitle?: string;
};

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

// Constant untuk reuse
const MAP_FALLBACK_CONFIG = {
  icon: "map-outline" as const,
  title: "Map Preview",
  message:
    "Your location is ready to be saved. Map view requires additional setup.",
  iconSize: 40,
  iconColor: "#EDECE3" as const,
};

const LABEL_OPTIONS = [
  { label: "Home", icon: "home" as const },
  { label: "Work", icon: "briefcase" as const },
  { label: "Gym", icon: "fitness" as const },
  { label: "Other", icon: "location" as const },
] as const;

export default function LocationsScreen() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const { addLocation } = useLocations();

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
  const [label, setLabel] = useState<string>(LABEL_OPTIONS[0].label);
  const [isDefault, setIsDefault] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  /* ========================
     MEMOIZED VALUES
  ======================== */
  const locationCoords = useMemo(
    () => currentLocation?.coords,
    [currentLocation]
  );
  const cameraPosition = useMemo(() => {
    if (!locationCoords) return null;
    return {
      center: {
        latitude: locationCoords.latitude,
        longitude: locationCoords.longitude,
      },
      zoom: 16,
      heading: 0,
      pitch: 0,
    };
  }, [locationCoords]);

  const isSaveDisabled = useMemo(() => {
    return saveLoading || !address.trim() || !currentLocation;
  }, [saveLoading, address, currentLocation]);

  const buttonTitle = useMemo(() => {
    return saveLoading ? "Saving Location..." : "Save Location";
  }, [saveLoading]);

  /* ========================
     GET CURRENT LOCATION - Optimized with useCallback
  ======================== */
  const getCurrentLocation = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      // Lazy-load expo-location dengan chunking
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
              onPress: () => {
                // Gunakan request secara native
                expoLocation
                  .getProviderStatusAsync()
                  .then(() => expoLocation.enableNetworkProviderAsync())
                  .catch(console.error);
              },
            },
          ]
        );
        setLoading(false);
        return;
      }

      // Gunakan accuracy yang sesuai dengan kebutuhan
      const location = await getCurrentPositionAsync({
        accuracy: expoLocation.Accuracy.Balanced, // Optimasi baterai vs akurasi
      });

      setCurrentLocation(location);

      // Reverse geocoding dengan error boundary
      try {
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
      } catch (geocodeError) {
        console.warn("Reverse geocoding failed:", geocodeError);
        setAddress("Current Location");
      }

      // Lazy-load maps hanya jika diperlukan
      if (Platform.OS === "ios" || Platform.OS === "android") {
        try {
          const maps = await import("expo-maps");
          setMapModules({
            AppleMaps: maps.AppleMaps,
            GoogleMaps: maps.GoogleMaps,
          });
        } catch (e) {
          console.warn("Maps module not available:", e);
        }
      }
    } catch (error) {
      console.error("Location error:", error);
      Toast.show({
        type: "error",
        text1: "Location Error",
        text2: "Could not retrieve your location. Please try again.",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, router]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  /* ========================
     SAVE LOCATION - Optimized
  ======================== */
  const handleSaveLocation = useCallback(async () => {
    if (!currentLocation || !address.trim()) {
      Toast.show({
        type: "error",
        text1: "Address Required",
        text2: "Please enter a valid address",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setSaveLoading(true);

      const locationData: Omit<Location, "id" | "createdAt"> = {
        address: address.trim(),
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        label,
        isDefault,
      };

      // Gunakan hook useLocations untuk menyimpan
      await addLocation(locationData);

      // Optimasi navigation dengan delay minimal
      setTimeout(() => router.back(), 500);
    } catch (error: any) {
      // Error handling sudah dilakukan di hook useLocations
      console.error("Save location error:", error);
    } finally {
      setSaveLoading(false);
    }
  }, [currentLocation, address, label, isDefault, addLocation, router]);

  /* ========================
     MAP RENDERER - Optimized dengan memo
  ======================== */
  const MapFallback = useCallback(
    () => (
      <View className="flex-1 items-center justify-center bg-muted">
        <View className="w-20 h-20 items-center justify-center bg-primary rounded-2xl mb-4">
          <Ionicons
            name={MAP_FALLBACK_CONFIG.icon}
            size={MAP_FALLBACK_CONFIG.iconSize}
            color={MAP_FALLBACK_CONFIG.iconColor}
          />
        </View>
        <Text className="text-lg font-semibold text-primary mb-2">
          {MAP_FALLBACK_CONFIG.title}
        </Text>
        <Text className="text-accent text-center px-8">
          {MAP_FALLBACK_CONFIG.message}
        </Text>
      </View>
    ),
    []
  );

  const renderMap = useCallback(() => {
    if (!currentLocation || !cameraPosition) return <MapFallback />;

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
            // Optimasi performa maps
            showsTraffic={false}
            showsPointsOfInterest={false}
            showsBuildings={false}
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
            // Optimasi performa maps
            showsTraffic={false}
            showsIndoorLevelPicker={false}
            showsIndoors={false}
          />
        );
      }

      return <MapFallback />;
    } catch {
      return <MapFallback />;
    }
  }, [currentLocation, cameraPosition, markers, mapModules, MapFallback]);

  /* ========================
     HANDLERS - Optimized dengan useCallback
  ======================== */
  const handleLabelSelect = useCallback((selectedLabel: string) => {
    setLabel(selectedLabel);
  }, []);

  const handleAddressChange = useCallback((text: string) => {
    setAddress(text);
  }, []);

  const handleToggleDefault = useCallback(() => {
    setIsDefault((prev) => !prev);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /* ========================
     LOADING STATE
  ======================== */
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

  /* ========================
     MAIN UI - Optimized dengan proper FlatList
  ======================== */
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* Header dengan LinearGradient */}
      <LinearGradient
        colors={["#6D2F13", "#C25322"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView edges={["top"]}>
          <View className="px-6 pt-4">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={handleBack}
                className="w-10 h-10 items-center justify-center rounded-full bg-white active:bg-muted"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Map Section */}
        <View className="h-72 bg-muted">
          {renderMap()}
          <View className="absolute bottom-6 left-0 right-0 items-center">
            <View className="bg-primary px-4 py-3 rounded-full flex-row items-center shadow-hard">
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
              <View className="w-10 h-10 items-center justify-center rounded-xl mr-3">
                <Ionicons name="home" size={22} color="#6D2F13" />
              </View>
              <View className="flex-1">
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
                onChangeText={handleAddressChange}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Enter street address, city, and postal code"
                placeholderTextColor="#AE562F"
                editable={!saveLoading}
                maxLength={200}
              />
            </View>
          </View>

          {/* Label Selection */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 items-center justify-center rounded-xl mr-3">
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
              {LABEL_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => handleLabelSelect(item.label)}
                  className={`flex-row items-center px-4 py-3 rounded-xl ${
                    label === item.label
                      ? "bg-primary border-2 border-primary"
                      : "bg-muted border-2 border-muted"
                  }`}
                  activeOpacity={0.7}
                  disabled={saveLoading}
                >
                  <Ionicons
                    name={item.icon}
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
              onPress={handleToggleDefault}
              className="flex-row items-center justify-between bg-muted rounded-2xl p-4 shadow-soft border border-muted"
              activeOpacity={0.7}
              disabled={saveLoading}
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
                  className={`w-6 h-6 rounded-full bg-white transform transition-transform duration-200 ${
                    isDefault ? "translate-x-6" : ""
                  }`}
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
            disabled={isSaveDisabled}
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
                {buttonTitle}
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
    </View>
  );
}
