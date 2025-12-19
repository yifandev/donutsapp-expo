import PrimaryButton from "@/components/PrimaryButton";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Gunakan session dari Better Auth
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Update isLoading berdasarkan status loading session
  useEffect(() => {
    if (!sessionLoading) {
      setIsLoading(false);
    }
  }, [sessionLoading]);

  const handleSignIn = () => {
    if (session) {
      // Jika sudah ada session, arahkan ke home
      router.replace("/user/home");
    } else {
      // Jika belum ada session, arahkan ke sign-in
      router.push("/sign-in");
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Logo tengah */}
      <View className="flex-1 items-center justify-center">
        <Image
          source={require("../../assets/images/logo.png")}
          className="w-40 h-40"
          resizeMode="contain"
        />
      </View>

      {/* Bottom Card */}
      <View className="bg-white rounded-t-3xl px-6 pt-8 pb-10 shadow-lg">
        <Text className="text-2xl font-bold text-center text-primary">
          Selamat Datang di J.CO!
        </Text>

        <Text className="text-center text-gray-400 mt-2 mb-6">
          {isLoading
            ? "Memuat..."
            : session
              ? "Selamat datang kembali!"
              : "Mari mulai dengan Memasukan Akun"}
        </Text>

        <PrimaryButton
          onPress={handleSignIn}
          title={
            isLoading ? "Memuat..." : session ? "Masuk ke Akun" : "Masuk Akun"
          }
          disabled={isLoading}
          loading={isLoading}
        />

        {/* Developer Info */}
        <TouchableOpacity className="mb-6">
          <Text className="text-center text-slate-700 mt-4">
            By Yifan Developer{" "}
            <Text className="text-primary font-semibold">
              yifandev@gmail.com
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
