import { useLocations } from "@/hooks/useLocations";
import { authClient } from "@/lib/auth-client";
import { Location } from "@/utils/address-helpers";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

/* =======================
   TYPES
======================= */
// Anda bisa menghapus interface Location jika sudah ada di address-helpers

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
    addLocation,
    deleteLocation,
  } = useLocations();

  /* =======================
     INITIAL LOAD
  ======================= */
  useEffect(() => {
    if (!session?.user?.id) {
      router.replace("/sign-in");
      return;
    }

    fetchLocations();
  }, [session?.user?.id]);

  /* =======================
     HANDLERS
  ======================= */
  const handleRefresh = () => {
    fetchLocations(true);
  };

  const handleSelectLocation = (locationId: string) => {
    setSelectedId(locationId);
  };

  const handleUseLocation = (location: Location) => {
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
            });

            // Anda bisa menambahkan logika untuk mengirim location kembali ke screen sebelumnya
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
  };

  const handleAddNewLocation = () => {
    router.push("/user/locations");
  };

  const handleEditLocation = (location: Location) => {
    Alert.alert("Edit Lokasi", "Fungsi pengeditan akan segera diterapkan.", [
      { text: "OK", style: "default" },
    ]);
  };

  const handleDeleteLocation = (location: Location) => {
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getLabelIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "home":
        return "home";
      case "work":
        return "briefcase";
      case "gym":
        return "fitness";
      default:
        return "location";
    }
  };

  /* =======================
     LOADING STATE
  ======================= */
  if (loading) {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView className="flex-1 bg-gray-50">
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

  /* =======================
     EMPTY STATE
  ======================= */
  if (locations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LinearGradient
          colors={["#6D2F13", "#C25322"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pb-6"
        >
          <View className="px-6 pt-6 mt-6">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-white active:bg-muted"
              >
                <Ionicons name="chevron-back" size={24} color="#6D2F13" />
              </TouchableOpacity>

              <View className="items-center flex-1 px-4">
                <Text className="text-2xl font-bold text-white">
                  My Locations
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleAddNewLocation}
                className="w-10 h-10 items-center justify-center rounded-full bg-white active:bg-muted"
              >
                <Ionicons name="add" size={24} color="#6D2F13" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center">
            <View className="w-24 h-24 items-center justify-center bg-muted rounded-full mb-6">
              <Ionicons name="location-outline" size={48} color="#AE562F" />
            </View>
            <Text className="text-2xl font-bold text-primary mb-2">
              No Saved Locations
            </Text>
            <Text className="text-accent text-center mb-8">
              You haven't saved any locations yet. Add your first pickup
              location to get started.
            </Text>
            <TouchableOpacity
              onPress={handleAddNewLocation}
              className="bg-primary rounded-2xl px-8 py-4 flex-row items-center"
            >
              <Ionicons name="add-circle" size={24} color="#EDECE3" />
              <Text className="text-white font-semibold text-lg ml-3">
                Add First Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================
     MAIN UI
  ======================= */
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#6D2F13", "#C25322"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View className="px-6 pt-6 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-white active:bg-muted"
            >
              <Ionicons name="chevron-back" size={24} color="#6D2F13" />
            </TouchableOpacity>

            <View className="items-center flex-1 px-4">
              <Text className="text-2xl font-bold text-white">Lokasi Saya</Text>
              <Text className="text-white text-sm mt-1">
                {locations.length} lokasi tersimpan
                {locations.length !== 1 ? "s" : ""}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleAddNewLocation}
              className="w-10 h-10 items-center justify-center rounded-full bg-white active:bg-muted"
            >
              <Ionicons name="add" size={24} color="#6D2F13" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Locations List */}
      <View className="flex-1 bg-gray-50 px-4 mt-2">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#6D2F13"]}
              tintColor="#6D2F13"
            />
          }
        >
          {locations.map((location) => (
            <TouchableOpacity
              key={location.id}
              onPress={() => handleSelectLocation(location.id)}
              onLongPress={() => handleEditLocation(location)}
              className={`bg-white rounded-2xl p-4 mb-4 shadow-medium border-2 ${
                selectedId === location.id
                  ? "border-primary"
                  : "border-transparent"
              } ${location.isDefault ? "border-l-4 border-l-green-500" : ""}`}
              activeOpacity={0.7}
            >
              {/* Location Header */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-12 h-12 items-center justify-center rounded-xl mr-3 ${
                      location.isDefault ? "bg-green-100" : "bg-muted"
                    }`}
                  >
                    <Ionicons
                      name={getLabelIcon(location.label) as any}
                      size={24}
                      color={location.isDefault ? "#10B981" : "#6D2F13"}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-lg font-bold text-primary">
                        {location.label}
                      </Text>
                      {location.isDefault && (
                        <View className="flex-row items-center ml-2 bg-green-100 px-2 py-1 rounded-full">
                          <Ionicons name="star" size={12} color="#10B981" />
                          <Text className="text-green-700 text-xs font-medium ml-1">
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-accent text-sm">
                      Ditambahkan {formatDate(location.createdAt)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleEditLocation(location)}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color="#AE562F"
                  />
                </TouchableOpacity>
              </View>

              {/* Address */}
              <View className="mb-4">
                <Text className="text-accent text-sm mb-1">Alamat</Text>
                <Text className="text-primary text-base leading-6">
                  {location.address}
                </Text>
              </View>

              {/* Coordinates */}
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-accent text-sm mb-1">Coordinates</Text>
                  <Text className="text-primary text-sm">
                    {location.latitude.toFixed(6)},{" "}
                    {location.longitude.toFixed(6)}
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
                  onPress={() => handleUseLocation(location)}
                  className="flex-1 bg-primary rounded-xl py-3 flex-row items-center justify-center"
                >
                  <Ionicons name="checkmark-circle" size={20} color="#EDECE3" />
                  <Text className="text-white font-semibold ml-2">
                    Gunakan Lokasi Ini
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteLocation(location)}
                  className="w-12 items-center justify-center bg-red-100 rounded-xl"
                >
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "View on Map",
                      "Map view will be implemented soon.",
                      [{ text: "OK", style: "default" }]
                    );
                  }}
                  className="w-12 items-center justify-center bg-muted rounded-xl"
                >
                  <Ionicons name="map" size={20} color="#6D2F13" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
