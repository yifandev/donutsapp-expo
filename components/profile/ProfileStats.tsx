import React from "react";
import { Text, View } from "react-native";

interface ProfileStatsProps {
  ordersCount: number;
  locationsCount: number;
  memberSince: string | Date;
}

export function ProfileStats({
  ordersCount,
  locationsCount,
  memberSince,
}: ProfileStatsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
    });
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
          <Text className="text-3xl font-bold text-secondary">
            {locationsCount}
          </Text>
          <Text className="text-xs text-gray-600 mt-1">Lokasi</Text>
        </View>

        {/* Divider */}
        <View className="w-px bg-gray-200" />

        {/* Member Since */}
        <View className="items-center flex-1">
          <Text className="text-xs font-bold text-accent">
            {formatDate(memberSince.toString())}
          </Text>
          <Text className="text-xs text-gray-600 mt-1">Member Sejak</Text>
        </View>
      </View>
    </View>
  );
}
