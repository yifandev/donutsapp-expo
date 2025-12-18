import { categories } from "@/data/DummyData";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export default function CategoryMenu() {
  const [selectedCategory, setSelectedCategory] = useState("1");

  return (
    <View className="mt-2">
      <Text className="text-lg font-bold text-primary mx-5 mb-3">
        Categories
      </Text>
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mr-4 items-center"
            onPress={() => setSelectedCategory(item.id)}
          >
            <View
              className={`w-16 h-16 rounded-2xl items-center justify-center shadow-md ${
                selectedCategory === item.id
                  ? "border-2 border-orange-500 bg-white"
                  : "bg-white"
              } ${item.color}`}
            >
              <Text className="text-2xl">{item.icon}</Text>
            </View>
            <Text
              className={`mt-2 text-xs font-medium ${
                selectedCategory === item.id
                  ? "text-orange-500"
                  : "text-gray-600"
              }`}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
