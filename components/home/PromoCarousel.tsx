import { promoImages } from "@/data/DummyData";
import { useRef, useState } from "react";
import { Dimensions, FlatList, Image, Text, View } from "react-native";

const { width } = Dimensions.get("window");

export default function PromoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={promoImages}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width - 40}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View className="mr-4 relative">
            <Image
              source={{ uri: item.image }}
              className="h-52 rounded-2xl"
              style={{ width: width - 40 }}
            />
            <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-2xl">
              <Text className="text-white font-bold text-lg">{item.title}</Text>
              <Text className="text-white/90 text-sm mt-1">
                {item.subtitle}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View className="flex-row justify-center mt-4">
        {promoImages.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${
              index === activeIndex ? "w-6 bg-secondary" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
