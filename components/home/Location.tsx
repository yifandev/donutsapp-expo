import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface OrderPromptProps {
  onPress?: () => void;
}

export default function OrderPrompt({ onPress }: OrderPromptProps) {
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
            <Text className="text-primary font-semibold text-sm">
              What would you like to order today?
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#C25322" />
              <Text className="text-gray-600 text-xs ml-1">
                Delivery to Home • 20-30 min
              </Text>
            </View>
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
