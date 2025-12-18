import { useRef } from "react";
import { Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (otp: string) => void;
  error?: string;
};

export default function OtpInput({ value, onChange, error }: Props) {
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = value.split("");
    newOtp[index] = text;

    const otpString = newOtp.join("");
    onChange(otpString);

    // Auto-focus ke input berikutnya
    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-unfocus ke input sebelumnya jika kosong
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View>
      <View className="flex-row justify-between">
        {[0, 1, 2, 3].map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputs.current[index] = ref;
            }}
            value={value[index] || ""}
            maxLength={1}
            keyboardType="number-pad"
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            className={`
              w-16 h-16 rounded-xl 
              ${error ? "bg-red-50 border border-red-300" : "bg-blue-50 border border-blue-100"}
              text-center text-2xl font-bold text-text
              ${index === Math.min(value.length, 3) ? "border-2 border-primary" : ""}
            `}
            selectionColor="#3B82F6"
            autoFocus={index === 0}
          />
        ))}
      </View>

      {error && (
        <Text className="text-red-500 text-sm mt-3 text-center">{error}</Text>
      )}
    </View>
  );
}
