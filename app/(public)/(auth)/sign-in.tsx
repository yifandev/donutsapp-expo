import EmailInput from "@/components/auth/EmailInput";
import SocialButton from "@/components/auth/SocialButton";
import PrimaryButton from "@/components/PrimaryButton";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

// Type untuk form
type EmailFormType = {
  email: string;
};

// EMAIL REGEX constant untuk reuse
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Toast config untuk reuse
const TOAST_CONFIG = {
  autoHide: true,
  visibilityTime: 4000,
  topOffset: 60,
} as const;

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid: formIsValid },
    setError,
    clearErrors,
    watch,
    trigger,
  } = useForm<EmailFormType>({
    defaultValues: {
      email: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const emailValue = watch("email");

  // Validasi email dengan useCallback
  const validateEmail = useCallback((email: string): boolean => {
    return EMAIL_REGEX.test(email);
  }, []);

  // Validasi form dengan useCallback
  const validateForm = useCallback((): boolean => {
    const email = emailValue.trim();

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
  }, [emailValue, validateEmail, setError, clearErrors]);

  // Handle email input change dengan debounce effect
  const handleEmailChange = useCallback(
    (email: string) => {
      clearErrors("email");
      trigger("email");
    },
    [clearErrors, trigger]
  );

  // Submit handler dengan useCallback
  const onSubmit = useCallback(
    async (data: EmailFormType) => {
      // Validasi final
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      try {
        // Kirim OTP ke email
        const result = await authClient.emailOtp.sendVerificationOtp({
          email: data.email.trim(),
          type: "sign-in",
        });

        if (result.error) {
          Toast.show({
            type: "error",
            text1: "Gagal mengirim OTP",
            text2: result.error.message || "Silakan coba lagi",
            ...TOAST_CONFIG,
          });
          return;
        }

        Toast.show({
          type: "success",
          text1: "OTP telah dikirim ke email kamu",
          text2: "Cek inbox atau folder spam ya!",
          ...TOAST_CONFIG,
        });

        // Optimasi navigation dengan replace
        router.replace({
          pathname: "/verify-email",
          params: {
            email: data.email.trim(),
          },
        });
      } catch (error) {
        console.error("Sign in error:", error);
        Toast.show({
          type: "error",
          text1: "Terjadi kesalahan",
          text2: "Silakan coba lagi nanti",
          ...TOAST_CONFIG,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, router]
  );

  // Handle social login dengan useCallback
  const handleSocialLogin = useCallback(
    async (provider: "google" | "github" | "apple") => {
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
          ...TOAST_CONFIG,
        });
      }
    },
    []
  );

  // Gunakan useMemo untuk kondisi yang sering berubah
  const isSubmitDisabled = useMemo(() => {
    return !formIsValid || isLoading || !emailValue.trim();
  }, [formIsValid, isLoading, emailValue]);

  const buttonTitle = useMemo(() => {
    return isLoading ? "Mengirim OTP..." : "Masuk Akun";
  }, [isLoading]);

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
        title={buttonTitle}
        disabled={isSubmitDisabled}
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
          testID="github-login-button"
        />
        <SocialButton
          type="google"
          onPress={() => handleSocialLogin("google")}
          testID="google-login-button"
        />
        <SocialButton
          type="apple"
          onPress={() => handleSocialLogin("apple")}
          testID="apple-login-button"
        />
      </View>

      {/* Privacy Policy */}
      <TouchableOpacity
        className="mt-8"
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
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
