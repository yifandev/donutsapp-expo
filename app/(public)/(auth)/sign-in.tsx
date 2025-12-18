import EmailInput from "@/components/auth/EmailInput";
import PrimaryButton from "@/components/auth/PrimaryButton";
import SocialButton from "@/components/auth/SocialButton";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

// Type untuk form
type EmailFormType = {
  email: string;
};

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm<EmailFormType>({
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const emailValue = watch("email");

  // Validasi email manual
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validasi on change
  const validateForm = (): boolean => {
    const email = emailValue;

    if (!email) {
      setError("email", {
        type: "manual",
        message: "Email wajib diisi",
      });
      return false;
    }

    if (!validateEmail(email)) {
      setError("email", {
        type: "manual",
        message: "Format email tidak valid",
      });
      return false;
    }

    clearErrors("email");
    return true;
  };

  // Cek validasi sebelum submit
  const isValid = !errors.email && emailValue.length > 0;

  const onSubmit = async (data: EmailFormType) => {
    // Validasi final sebelum submit
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Kirim OTP ke email
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: data.email,
        type: "sign-in",
      });

      if (result.error) {
        Toast.show({
          type: "error",
          text1: "Gagal mengirim OTP",
          text2: result.error.message || "Silakan coba lagi",

          autoHide: true,
        });
        setIsLoading(false);
        return;
      }

      Toast.show({
        type: "success",
        text1: "OTP telah dikirim ke email kamu",
        text2: "Cek inbox atau folder spam ya!",

        autoHide: true,
      });
      router.push({
        pathname: "/verify-email",
        params: {
          email: data.email,
        },
      });
    } catch (error) {
      console.error("Sign in error:", error);
      Toast.show({
        type: "error",
        text1: "Terjadi kesalahan",
        text2: "Silakan coba lagi nanti",

        autoHide: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email input change
  const handleEmailChange = (email: string) => {
    clearErrors("email");
    validateForm();
  };

  const handleSocialLogin = async (provider: "google" | "github" | "apple") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/user/home",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Login gagal",
        text2: "Coba lagi dengan provider lain",

        autoHide: true,
      });
    }
  };

  return (
    <View className="flex-1 px-6 pt-10 bg-white">
      <Text className="text-2xl font-bold text-primary mt-6">Masukan Akun</Text>
      <Text className="text-gray-400 mt-1">
        Masukkan Email yang aktif dan sering digunakan
      </Text>

      <View className="mt-6">
        <EmailInput
          control={control}
          error={errors.email?.message}
          onChangeText={handleEmailChange}
        />
      </View>

      <PrimaryButton
        className="mt-8"
        title={isLoading ? "Mengirim OTP..." : "Masuk Akun"}
        disabled={!isValid || isLoading}
        loading={isLoading}
        onPress={handleSubmit(onSubmit)}
      />

      {/* Divider */}
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-[1px] bg-gray-200" />
        <Text className="mx-3 text-gray-400 text-sm">
          atau lanjutkan dengan
        </Text>
        <View className="flex-1 h-[1px] bg-gray-200" />
      </View>

      {/* Social Login */}
      <View className="flex-row justify-center gap-4">
        <SocialButton
          type="github"
          onPress={() => handleSocialLogin("github")}
        />
        <SocialButton
          type="google"
          onPress={() => handleSocialLogin("google")}
        />
        <SocialButton type="apple" onPress={() => handleSocialLogin("apple")} />
      </View>

      {/* Skip Button */}
      <TouchableOpacity className="mt-8">
        <Text className="text-center text-secondary font-semibold">
          Privacy Policy & Terms of Service
        </Text>
      </TouchableOpacity>

      {/* Terms */}
      <Text className="text-xs text-gray-400 text-center mt-4 leading-4">
        Dengan melanjutkan, Anda menyetujui kami
      </Text>
    </View>
  );
}
