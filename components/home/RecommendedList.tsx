import { recommended } from "@/data/DummyData";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FlatList, Image, Text, View } from "react-native";

export default function RecommendedList({ ListHeaderComponent }: any) {
  return (
    <FlatList
      data={recommended}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
      ListHeaderComponent={ListHeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 20 }}
      renderItem={({ item }) => (
        <View className="mx-5 bg-white rounded-2xl mb-4 p-4 shadow-lg">
          <View className="flex-row">
            <Image
              source={{ uri: item.image }}
              className="w-24 h-24 rounded-xl"
            />

            <View className="flex-1 ml-4">
              <View className="flex-row justify-between items-start">
                <Text className="font-bold text-text text-lg flex-1">
                  {item.title}
                </Text>
                {item.promo && (
                  <View className="bg-red-500 px-3 py-1 rounded-full">
                    <Text className="text-xs text-white font-bold">PROMO</Text>
                  </View>
                )}
              </View>

              <Text className="text-sm text-gray-500 mt-1">
                {item.category}
              </Text>

              <View className="flex-row items-center mt-2">
                <FontAwesome
                  name="star"
                  size={16}
                  color="#FFB800"
                  fill="#FFB800"
                />
                <Text className="text-amber-600 font-semibold ml-1">
                  {item.rating}
                </Text>
                <Text className="text-gray-400 text-sm ml-1">•</Text>
                <Text className="text-gray-400 text-sm ml-1">120 reviews</Text>
              </View>

              <View className="flex-row items-center justify-between mt-3">
                <View className="flex-row items-baseline">
                  <Text className="font-bold text-text text-xl">
                    {item.price}
                  </Text>
                  {item.originalPrice && (
                    <Text className="text-gray-400 line-through text-sm ml-2">
                      {item.originalPrice}
                    </Text>
                  )}
                </View>

                <View className="bg-secondary rounded-full w-10 h-10 items-center justify-center">
                  <Text className="text-white text-xl">+</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View className="items-center justify-center py-10">
          <Text className="text-gray-400">No items available</Text>
        </View>
      }
    />
  );
}
