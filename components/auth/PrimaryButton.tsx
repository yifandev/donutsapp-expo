import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  className = "",
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        ${disabled ? "bg-gray-300" : "bg-secondary"} 
        py-4 rounded-full
        flex-row justify-center items-center
        ${disabled ? "" : "active:opacity-90"}
        ${className}
      `}
      style={{
        elevation: disabled ? 0 : 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <Text
          className={`
          text-white text-center font-bold text-base
          ${disabled ? "opacity-70" : ""}
        `}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
