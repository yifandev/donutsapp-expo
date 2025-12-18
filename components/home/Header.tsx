import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const { data: session } = authClient.useSession();
  const [greeting, setGreeting] = useState("Morning");
  const [cartItemsCount] = useState(3); // Dummy cart items count

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Evening";
    } else {
      return "Night";
    }
  };

  useEffect(() => {
    // Set greeting awal
    setGreeting(getGreeting());

    // Optional: Update greeting setiap jam
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 3600000); // Update setiap 1 jam (3600000 ms)

    return () => clearInterval(interval);
  }, []);

  // Fungsi untuk mengambil nama dari email
  const getUserName = () => {
    if (!session?.user?.email) return "Guest";

    const email = session.user.email;
    const namePart = email.split("@")[0];

    // Capitalize first letter
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  return (
    <LinearGradient
      colors={["#6D2F13", "#C25322"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="px-5 pt-14 pb-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm text-white/90 mb-1">Good {greeting},</Text>
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-white mr-2">
              {getUserName()}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="relative w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="search" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity className="relative w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="cart-outline" size={22} color="#FFFFFF" />

            {/* Cart Badge */}
            {cartItemsCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 min-w-5 h-5 rounded-full items-center justify-center border border-white">
                <Text className="text-xs text-white font-bold">
                  {cartItemsCount > 9 ? "9+" : cartItemsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
