import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface OrderPromptProps {
  onPress?: () => void;
  currentLocation?: {
    label: string;
    address: string;
  } | null;
}

export default function OrderPrompt({
  onPress,
  currentLocation,
}: OrderPromptProps) {
  // Data default jika tidak ada currentLocation
  const locationData = currentLocation || {
    label: "Set location",
    address: "Tap to select delivery address",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mx-5 bg-white rounded-xl p-4 shadow-lg"
    >
      <View className="flex-row items-center justify-between">
        {/* Bagian kiri dengan icon location */}
        <View className="flex-row items-center flex-1">
          <View className="mr-3">
            <Ionicons name="location" size={30} color="#C25322" />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-600 text-xs ">
                Delivery to {locationData.label}
              </Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">
              {locationData.address}
            </Text>
          </View>
        </View>

        {/* Bagian kanan dengan icon panah ke bawah */}
        <View className="ml-3">
          <Ionicons name="chevron-down" size={20} color="#C25322" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
