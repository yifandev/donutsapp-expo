import { useLocations } from "@/hooks/useLocations";
import { authClient } from "@/lib/auth-client";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface ProfileStatsProps {
  ordersCount: number;
  memberSince: string | Date;
}

export function ProfileStats({ ordersCount, memberSince }: ProfileStatsProps) {
  const { data: session } = authClient.useSession();
  const { locations, loading, fetchLocations } = useLocations();

  const [isLoadingLocations, setIsLoadingLocations] = React.useState(false);

  // Ambil data lokasi saat komponen dimount
  React.useEffect(() => {
    const loadLocations = async () => {
      if (session?.user?.id) {
        setIsLoadingLocations(true);
        try {
          await fetchLocations();
        } catch (error) {
          console.error("Failed to fetch locations:", error);
        } finally {
          setIsLoadingLocations(false);
        }
      }
    };

    loadLocations();
  }, [session?.user?.id, fetchLocations]);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
    });
  };

  // Hitung jumlah lokasi
  const getLocationsCount = () => {
    if (!locations || locations.length === 0) return 0;

    // Karena Location mungkin tidak memiliki isActive,
    // kita hitung semua lokasi yang ada
    return locations.length;
  };

  return (
    <View className="mx-6 my-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
      <Text className="text-lg font-semibold text-primary mb-4">Statistik</Text>

      <View className="flex-row justify-around">
        {/* Orders */}
        <View className="items-center flex-1">
          <Text className="text-3xl font-bold text-primary">{ordersCount}</Text>
          <Text className="text-xs text-gray-600 mt-1">Pesanan</Text>
        </View>

        {/* Divider */}
        <View className="w-px bg-gray-200" />

        {/* Locations */}
        <View className="items-center flex-1">
          {isLoadingLocations ? (
            <ActivityIndicator size="small" color="#6D2F13" />
          ) : (
            <Text className="text-3xl font-bold text-secondary">
              {getLocationsCount()}
            </Text>
          )}
          <Text className="text-xs text-gray-600 mt-1">Lokasi</Text>
        </View>

        {/* Divider */}
        <View className="w-px bg-gray-200" />

        {/* Member Since */}
        <View className="items-center flex-1">
          <Text className="text-xs font-bold text-accent">
            {formatDate(memberSince)}
          </Text>
          <Text className="text-xs text-gray-600 mt-1">Member Sejak</Text>
        </View>
      </View>
    </View>
  );
}
