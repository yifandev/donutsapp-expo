import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ProfileMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  iconColor?: string;
  danger?: boolean;
}

export function ProfileMenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  iconColor,
  danger = false,
}: ProfileMenuItemProps) {
  const getIconColor = () => {
    if (danger) return "#EF4444";
    if (iconColor) return iconColor;
    return "#6D2F13"; // primary color
  };

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 px-6 bg-white active:bg-gray-50"
    >
      {/* Icon */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: danger ? "#FEE2E2" : "#EDECE3" }}
      >
        <Ionicons name={icon} size={20} color={getIconColor()} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${danger ? "text-red-600" : "text-gray-800"}`}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text>
        )}
      </View>

      {/* Chevron */}
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={danger ? "#EF4444" : "#9CA3AF"}
        />
      )}
    </Pressable>
  );
}
