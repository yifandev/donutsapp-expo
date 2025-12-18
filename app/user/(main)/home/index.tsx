import CategoryMenu from "@/components/home/CategoryMenu";
import Header from "@/components/home/Header";
import Locations from "@/components/home/Location";
import PromoCarousel from "@/components/home/PromoCarousel";
import RecommendedList from "@/components/home/RecommendedList";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const HandleLocation = () => {
    // Navigate to menu or search
    console.log("Order prompt pressed");
    router.push("/user/locations");
  };
  return (
    <View className="flex-1 bg-gray-50">
      <Header />

      <RecommendedList
        ListHeaderComponent={
          <>
            <View className="mt-6">
              <Locations onPress={HandleLocation} />
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
