import React from "react";
import { Text, View } from "react-native";

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 mb-2">
        {title}
      </Text>
      <View className="bg-white border-y border-gray-100">{children}</View>
    </View>
  );
}
