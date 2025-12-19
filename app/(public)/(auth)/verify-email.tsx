import OtpInput from "@/components/auth/OtpInput";
import PrimaryButton from "@/components/PrimaryButton";
import { authClient } from "@/lib/auth-client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

// Type untuk form
type OtpFormType = {
  otp: string;
};

// Constant untuk reuse
const OTP_REGEX = /^\d{4}$/;
const INITIAL_TIMER = 60;
const TOAST_CONFIG = {
  autoHide: true,
  visibilityTime: 4000,
  topOffset: 60,
} as const;

// Komponen ResendButton untuk mencegah re-render
const ResendButton = memo(
  ({
    canResend,
    timer,
    isResending,
    onPress,
  }: {
    canResend: boolean;
    timer: number;
    isResending: boolean;
    onPress: () => void;
  }) => {
    if (!canResend) {
      return (
        <Text className="text-gray-500 text-center">
          Tunggu <Text className="text-primary font-bold">{timer} detik</Text>{" "}
          sebelum mengirim ulang kode
        </Text>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isResending}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isResending ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text className="text-secondary font-bold text-lg">
            Kirim Ulang Kode ↻
          </Text>
        )}
      </TouchableOpacity>
    );
  }
);

ResendButton.displayName = "ResendButton";

export default function VerifyEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [timer, setTimer] = useState(INITIAL_TIMER);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const timerRef = useRef<number | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<OtpFormType>({
    defaultValues: { otp: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const otpValue = watch("otp");

  // ===== VALIDASI OTP =====
  const validateOtp = useCallback((otp: string): boolean => {
    return OTP_REGEX.test(otp);
  }, []);

  // ===== TIMER OTP =====
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    // Clear previous interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
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
  const handleResend = useCallback(async () => {
    setIsResending(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "sign-in",
      });

      if (result.error) {
        Toast.show({
          type: "error",
          text1: "Gagal mengirim ulang OTP",
          text2: result.error.message,
          ...TOAST_CONFIG,
        });
        return;
      }

      setTimer(INITIAL_TIMER);
      setCanResend(false);
      Toast.show({
        type: "success",
        text1: "OTP baru telah dikirim",
        ...TOAST_CONFIG,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Terjadi kesalahan",
        text2: error.message,
        ...TOAST_CONFIG,
      });
    } finally {
      setIsResending(false);
    }
  }, [email]);

  // ===== VERIFY OTP =====
  const onSubmit = useCallback(
    async (data: OtpFormType) => {
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
          email: email.trim(),
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
            ...TOAST_CONFIG,
          });
          return;
        }

        Toast.show({
          type: "success",
          text1: "OTP berhasil diverifikasi!",
          ...TOAST_CONFIG,
        });

        // Gunakan replace untuk mencegah kembali ke verify screen
        router.replace("/user/home");
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Terjadi kesalahan",
          text2: error.message,
          ...TOAST_CONFIG,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [validateOtp, email, router, setError, clearErrors]
  );

  // ===== HANDLE OTP CHANGE =====
  const handleOtpChange = useCallback(
    (value: string) => {
      clearErrors("otp");
      setValue("otp", value, { shouldValidate: true });

      // Auto-submit jika OTP lengkap dan valid
      if (value.length === 4 && OTP_REGEX.test(value) && !isLoading) {
        setTimeout(() => {
          handleSubmit(onSubmit)();
        }, 100); // Small delay for better UX
      }
    },
    [clearErrors, setValue, isLoading, handleSubmit, onSubmit]
  );

  // ===== VALIDATION EFFECT =====
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

  // ===== UI RENDER =====
  const isSubmitDisabled = useMemo(() => {
    return isLoading || otpValue.length < 4 || !!errors.otp;
  }, [isLoading, otpValue, errors.otp]);

  const buttonTitle = useMemo(() => {
    return isLoading ? "Memverifikasi..." : "Verifikasi & Lanjutkan";
  }, [isLoading]);

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
          onChange={handleOtpChange}
          error={errors.otp?.message}
        />
      </View>

      <PrimaryButton
        title={buttonTitle}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitDisabled}
        loading={isLoading}
        className="mt-8"
      />

      <View className="mt-8 items-center">
        <ResendButton
          canResend={canResend}
          timer={timer}
          isResending={isResending}
          onPress={handleResend}
        />
      </View>

      <TouchableOpacity
        className="mt-10"
        onPress={() => router.replace("/sign-in")}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text className="text-center text-gray-500">
          Kembali ke halaman login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
