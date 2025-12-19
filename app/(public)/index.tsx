import PrimaryButton from "@/components/PrimaryButton";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  // Gunakan useSession tanpa state tambahan
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Optimasi: Gunakan useCallback untuk handler
  const handleSignIn = useCallback(() => {
    if (session) {
      router.replace("/user/home");
    } else {
      router.push("/sign-in");
    }
  }, [session, router]);

  // Optimasi: Gunakan useMemo untuk nilai yang sering berubah
  const buttonTitle = useMemo(() => {
    if (sessionLoading) return "Memuat...";
    return session ? "Masuk ke Akun" : "Masuk Akun";
  }, [sessionLoading, session]);

  const welcomeText = useMemo(() => {
    if (sessionLoading) return "Memuat...";
    return session
      ? "Selamat datang kembali!"
      : "Mari mulai dengan Memasukan Akun";
  }, [sessionLoading, session]);

  return (
    <View className="flex-1 bg-background">
      {/* Logo tengah - optimasi dengan cache policy */}
      <View className="flex-1 items-center justify-center">
        <Image
          source={require("../../assets/images/logo.png")}
          className="w-40 h-40"
          resizeMode="contain"
          // Optimasi performa image loading
          fadeDuration={0}
          loadingIndicatorSource={require("../../assets/images/logo.png")}
        />
      </View>

      {/* Bottom Card */}
      <View className="bg-white rounded-t-3xl px-6 pt-8 pb-10 shadow-lg">
        <Text className="text-2xl font-bold text-center text-primary">
          Selamat Datang di J.CO!
        </Text>

        <Text className="text-center text-gray-400 mt-2 mb-6">
          {welcomeText}
        </Text>

        <PrimaryButton
          onPress={handleSignIn}
          title={buttonTitle}
          disabled={sessionLoading}
          loading={sessionLoading}
        />

        {/* Developer Info */}
        <TouchableOpacity
          className="mb-6"
          activeOpacity={0.7} // Optimasi feedback touch
        >
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
