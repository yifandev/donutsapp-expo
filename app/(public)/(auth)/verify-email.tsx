import OtpInput from "@/components/auth/OtpInput";
import PrimaryButton from "@/components/auth/PrimaryButton";
import { authClient } from "@/lib/auth-client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

// Type untuk form
type OtpFormType = {
  otp: string;
};

export default function VerifyEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid: formIsValid },
  } = useForm<OtpFormType>({
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  const otpValue = watch("otp");

  // ===== VALIDASI OTP =====
  const validateOtp = useCallback((otp: string): boolean => {
    return /^\d{4}$/.test(otp);
  }, []);

  useEffect(() => {
    if (!otpValue) {
      clearErrors("otp");
      return;
    }

    if (!validateOtp(otpValue) && otpValue.length >= 4) {
      setError("otp", {
        type: "manual",
        message: "OTP harus berupa 4 digit angka",
      });
    } else {
      clearErrors("otp");
    }
  }, [otpValue, validateOtp, setError, clearErrors]);

  // ===== TIMER OTP =====
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // ===== EMAIL WAJIB ADA =====
  if (!email) {
    return (
      <View className="flex-1 justify-center items-center px-6 bg-white">
        <Text className="text-xl font-bold text-gray-800">
          Email tidak ditemukan
        </Text>
        <Text className="text-gray-600 text-center mt-2 mb-6">
          Silakan kembali ke halaman login untuk mengirim OTP
        </Text>
        <PrimaryButton
          title="Kembali ke Login"
          onPress={() => router.replace("/sign-in")}
          className="w-full"
        />
      </View>
    );
  }

  // ===== RESEND OTP =====
  const handleResend = async () => {
    setIsResending(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (result.error) {
        Toast.show({
          type: "error",
          text1: "Gagal mengirim ulang OTP",
          text2: result.error.message,

          autoHide: true,
        });
        return;
      }

      setTimer(60);
      setCanResend(false);
      Toast.show({
        type: "success",
        text1: "OTP baru telah dikirim",

        autoHide: true,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Terjadi kesalahan",
        text2: error.message,

        autoHide: true,
      });
    } finally {
      setIsResending(false);
    }
  };

  // ===== VERIFY OTP =====
  const onSubmit = async (data: OtpFormType) => {
    if (!validateOtp(data.otp)) {
      setError("otp", {
        type: "manual",
        message: "OTP harus berupa 4 digit angka",
      });
      return;
    }

    setIsLoading(true);
    clearErrors("otp");

    try {
      const result = await authClient.signIn.emailOtp({
        email,
        otp: data.otp,
      });

      if (result.error) {
        setError("otp", {
          type: "manual",
          message: result.error.message || "Kode OTP salah",
        });

        Toast.show({
          type: "error",
          text1: "Verifikasi gagal",
          text2: result.error.message,

          autoHide: true,
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "OTP berhasil diverifikasi!",

        autoHide: true,
      });

      router.replace("/user/home");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Terjadi kesalahan",
        text2: error.message,

        autoHide: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ===== UI =====
  return (
    <View className="flex-1 px-6 pt-10 bg-white">
      <Text className="text-3xl font-bold text-text mt-6">
        Verifikasi Email
      </Text>

      <Text className="text-gray-500 mt-4 text-base leading-6">
        Masukkan kode verifikasi 4 digit yang telah dikirim ke:
      </Text>

      <Text className="text-primary font-semibold text-lg mt-2">{email}</Text>

      <View className="mt-8">
        <OtpInput
          value={otpValue}
          onChange={(v) => {
            clearErrors("otp");
            setValue("otp", v, { shouldValidate: true });
          }}
          error={errors.otp?.message}
        />
      </View>

      <PrimaryButton
        title={isLoading ? "Memverifikasi..." : "Verifikasi & Lanjutkan"}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading || otpValue.length < 4 || !!errors.otp}
        loading={isLoading}
        className="mt-8"
      />

      <View className="mt-8 items-center">
        {!canResend ? (
          <Text className="text-gray-500 text-center">
            Tunggu <Text className="text-primary font-bold">{timer} detik</Text>{" "}
            sebelum mengirim ulang kode
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={isResending}>
            {isResending ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text className="text-secondary font-bold text-lg">
                Kirim Ulang Kode ↻
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        className="mt-10"
        onPress={() => router.replace("/sign-in")}
      >
        <Text className="text-center text-gray-500">
          Kembali ke halaman login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
