import CategoryMenu from "@/components/home/CategoryMenu";
import Header from "@/components/home/Header";
import OrderPrompt from "@/components/home/OrderPrompt";
import PromoCarousel from "@/components/home/PromoCarousel";
import RecommendedList from "@/components/home/RecommendedList";
import { useLocations } from "@/hooks/useLocations";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { locations, fetchLocations, loading } = useLocations();

  // State untuk menyimpan lokasi yang dipilih
  const [selectedLocation, setSelectedLocation] = useState<{
    label: string;
    address: string;
  } | null>(null);

  // Fetch locations saat komponen mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle parameter dari address-list
  useEffect(() => {
    if (params.selectedLocation) {
      try {
        const location = JSON.parse(params.selectedLocation as string);
        setSelectedLocation({
          label: location.label,
          address: location.address,
        });
      } catch (error) {
        console.error("Error parsing selected location:", error);
      }
    }
  }, [params.selectedLocation]);

  const handleLocationPress = () => {
    router.push("/user/address-list");
  };

  // Prioritas: 1. Lokasi yang dipilih, 2. Lokasi default, 3. Lokasi pertama
  const getCurrentLocation = () => {
    // Jika ada lokasi yang dipilih dari address-list
    if (selectedLocation) {
      return selectedLocation;
    }

    if (!locations || locations.length === 0) {
      return null;
    }

    // Cari lokasi default
    const defaultLocation = locations.find((loc) => loc.isDefault);
    if (defaultLocation) {
      return {
        label: defaultLocation.label,
        address: defaultLocation.address,
      };
    }

    // Jika tidak ada default, ambil lokasi pertama
    const firstLocation = locations[0];
    return {
      label: firstLocation.label,
      address: firstLocation.address,
    };
  };

  const currentLocation = getCurrentLocation();

  return (
    <View className="flex-1 bg-gray-50">
      <Header />

      <RecommendedList
        ListHeaderComponent={
          <>
            <View className="mt-6">
              <OrderPrompt
                onPress={handleLocationPress}
                currentLocation={currentLocation}
              />
            </View>

            <View className="mt-8">
              <Text className="text-lg font-bold text-text mx-5 mb-3">
                Special Offers
              </Text>
              <PromoCarousel />
            </View>

            <CategoryMenu />

            <View className="mt-8 mx-5">
              <Text className="text-lg font-bold text-text mb-4">
                Recommended For You
              </Text>
            </View>
          </>
        }
      />
    </View>
  );
}
