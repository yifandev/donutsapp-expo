import { useLocations } from "@/hooks/useLocations";
import { authClient } from "@/lib/auth-client";
import { Location } from "@/utils/address-helpers";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

/* ========================
   CONSTANTS
======================== */
const EMPTY_STATE_CONFIG = {
  icon: "location-outline" as const,
  title: "Tidak Ada Lokasi Tersimpan",
  message:
    "Anda belum menyimpan lokasi apa pun. Tambahkan lokasi penjemputan pertama Anda untuk memulai.",
  buttonText: "Tambahkan Lokasi Pertama",
  iconSize: 48,
  iconColor: "#AE562F" as const,
};

const LABEL_ICONS: Record<string, string> = {
  home: "home",
  work: "briefcase",
  gym: "fitness",
  default: "location",
} as const;

const TOAST_CONFIG = {
  visibilityTime: 3000,
  topOffset: 60,
} as const;

export default function AddressListScreen() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const {
    locations,
    loading,
    refreshing,
    selectedId,
    setSelectedId,
    fetchLocations,
    deleteLocation,
  } = useLocations();

  /* ========================
     INITIAL LOAD
  ======================== */
  useEffect(() => {
    if (!session?.user?.id) {
      router.replace("/sign-in");
      return;
    }

    fetchLocations();
  }, [session?.user?.id, fetchLocations, router]);

  /* ========================
     MEMOIZED VALUES
  ======================== */
  const locationCountText = useMemo(() => {
    return `${locations.length} lokasi tersimpan${locations.length !== 1 ? "s" : ""}`;
  }, [locations.length]);

  const isEmptyState = useMemo(
    () => locations.length === 0,
    [locations.length]
  );

  /* ========================
     HANDLERS - Optimized dengan useCallback
  ======================== */
  const handleRefresh = useCallback(() => {
    fetchLocations(true);
  }, [fetchLocations]);

  const handleSelectLocation = useCallback(
    (locationId: string) => {
      setSelectedId(locationId);
    },
    [setSelectedId]
  );

  const handleUseLocation = useCallback(
    (location: Location) => {
      Alert.alert(
        "Gunakan Lokasi Ini?",
        `Apakah kamu ingin menggunakan "${location.label}" sebagai lokasi penjemputan Anda?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "gunakan Lokasi",
            style: "default",
            onPress: () => {
              Toast.show({
                type: "success",
                text1: "Lokasi Dipilih",
                text2: `${location.label} telah dipilih sebagai lokasi penjemputan Anda.`,
                ...TOAST_CONFIG,
              });

              router.replace({
                pathname: "/user/home",
                params: {
                  selectedLocation: JSON.stringify(location),
                },
              });
            },
          },
        ]
      );
    },
    [router]
  );

  const handleAddNewLocation = useCallback(() => {
    router.push("/user/locations");
  }, [router]);

  const handleEditLocation = useCallback((location: Location) => {
    Alert.alert("Edit Lokasi", "Fungsi pengeditan akan segera diterapkan.", [
      { text: "OK", style: "default" },
    ]);
  }, []);

  const handleDeleteLocation = useCallback(
    (location: Location) => {
      Alert.alert(
        "Hapus Lokasi",
        `Apakah kamu yakin ingin menghapus "${location.label}"?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus",
            style: "destructive",
            onPress: () => deleteLocation(location.id),
          },
        ]
      );
    },
    [deleteLocation]
  );

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  }, []);

  const getLabelIcon = useCallback((label: string) => {
    const normalizedLabel = label.toLowerCase();
    return LABEL_ICONS[normalizedLabel] || LABEL_ICONS.default;
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /* ========================
     FLATLIST RENDER ITEM
  ======================== */
  const renderLocationItem: ListRenderItem<Location> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleSelectLocation(item.id)}
        onLongPress={() => handleEditLocation(item)}
        className={`bg-white rounded-2xl p-4 mb-4 shadow-medium border-2 ${
          selectedId === item.id ? "border-primary" : "border-transparent"
        } ${item.isDefault ? "border-l-4 border-l-green-500" : ""}`}
        activeOpacity={0.7}
      >
        {/* Location Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View
              className={`w-12 h-12 items-center justify-center rounded-xl mr-3 ${
                item.isDefault ? "bg-green-100" : "bg-muted"
              }`}
            >
              <Ionicons
                name={getLabelIcon(item.label) as any}
                size={24}
                color={item.isDefault ? "#10B981" : "#6D2F13"}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-primary">
                  {item.label}
                </Text>
                {item.isDefault && (
                  <View className="flex-row items-center ml-2 bg-green-100 px-2 py-1 rounded-full">
                    <Ionicons name="star" size={12} color="#10B981" />
                    <Text className="text-green-700 text-xs font-medium ml-1">
                      Default
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-accent text-sm">
                Ditambahkan {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleEditLocation(item)}
            className="w-10 h-10 items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#AE562F" />
          </TouchableOpacity>
        </View>

        {/* Address */}
        <View className="mb-4">
          <Text className="text-accent text-sm mb-1">Alamat</Text>
          <Text className="text-primary text-base leading-6" numberOfLines={2}>
            {item.address}
          </Text>
        </View>

        {/* Coordinates */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-accent text-sm mb-1">Coordinates</Text>
            <Text className="text-primary text-sm">
              {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="navigate" size={16} color="#AE562F" />
            <Text className="text-accent text-sm ml-1">GPS</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => handleUseLocation(item)}
            className="flex-1 bg-primary rounded-xl py-3 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#EDECE3" />
            <Text className="text-white font-semibold ml-2">
              Gunakan Lokasi Ini
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDeleteLocation(item)}
            className="w-12 items-center justify-center bg-red-100 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={20} color="#EF4444" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert("View on Map", "Map view will be implemented soon.", [
                { text: "OK", style: "default" },
              ]);
            }}
            className="w-12 items-center justify-center bg-muted rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="map" size={20} color="#6D2F13" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [
      handleSelectLocation,
      handleEditLocation,
      handleUseLocation,
      handleDeleteLocation,
      getLabelIcon,
      formatDate,
      selectedId,
    ]
  );

  /* ========================
     LOADING STATE
  ======================== */
  if (loading) {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-20 h-20 items-center justify-center rounded-2xl mb-6">
              <ActivityIndicator size="large" color="#6D2F13" />
            </View>
            <Text className="text-accent text-center">
              Memuat lokasi Anda...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  /* ========================
     EMPTY STATE
  ======================== */
  if (isEmptyState) {
    return (
      <>
        <LinearGradient
          colors={["#6D2F13", "#C25322"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="px-6 pt-6 mt-6">
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
                  Lokasi Saya
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleAddNewLocation}
                className="w-10 h-10 items-center justify-center rounded-full bg-white active:bg-muted"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="add" size={24} color="#6D2F13" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center">
            <View className="w-24 h-24 items-center justify-center bg-muted rounded-full mb-6">
              <Ionicons
                name={EMPTY_STATE_CONFIG.icon}
                size={EMPTY_STATE_CONFIG.iconSize}
                color={EMPTY_STATE_CONFIG.iconColor}
              />
            </View>
            <Text className="text-2xl font-bold text-primary mb-2">
              {EMPTY_STATE_CONFIG.title}
            </Text>
            <Text className="text-accent text-center mb-8">
              {EMPTY_STATE_CONFIG.message}
            </Text>
            <TouchableOpacity
              onPress={handleAddNewLocation}
              className="bg-primary rounded-2xl px-8 py-4 flex-row items-center"
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={24} color="#EDECE3" />
              <Text className="text-white font-semibold text-lg ml-3">
                {EMPTY_STATE_CONFIG.buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  /* ========================
     KEY EXTRACTOR untuk FlatList
  ======================== */
  const keyExtractor = useCallback((item: Location) => item.id, []);

  /* ========================
     MAIN UI - Optimized dengan FlatList
  ======================== */
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#6D2F13", "#C25322"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView edges={["top"]}>
          <View className="px-6 pt-6">
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
                  Lokasi Saya
                </Text>
                <Text className="text-white text-sm mt-1">
                  {locationCountText}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleAddNewLocation}
                className="w-10 h-10 items-center justify-center rounded-full bg-white active:bg-muted"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="add" size={24} color="#6D2F13" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Locations List dengan FlatList */}
      <FlatList
        data={locations}
        renderItem={renderLocationItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        // Optimasi FlatList
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        // Performance props
        updateCellsBatchingPeriod={50}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: 200, // Approximate item height
          offset: 200 * index,
          index,
        })}
        ListFooterComponent={<View className="h-20" />}
      />
    </View>
  );
}
