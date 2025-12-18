import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface ProfileHeaderProps {
  name: string;
  email: string;
  image?: string | null;
  onEditPress: () => void;
}

export function ProfileHeader({
  name,
  email,
  image,
  onEditPress,
}: ProfileHeaderProps) {
  return (
    <LinearGradient
      colors={["#6D2F13", "#C25322"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="items-center pt-12 px-6"
    >
      {/* Profile Image Container */}
      <View className="relative ">
        <View className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden">
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-full h-full"
              resizeMode="cover"
              accessibilityLabel="Foto profil pengguna"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-primary/10">
              <Text className="text-white text-5xl font-bold">
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Edit Button */}
        <Pressable
          onPress={onEditPress}
          className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-primary items-center justify-center shadow-lg active:opacity-90 border-2 border-white"
          accessibilityLabel="Edit profil"
          accessibilityHint="Membuka modal untuk mengedit profil"
        >
          <Ionicons name="pencil-outline" size={20} color="white" />
        </Pressable>
      </View>

      {/* User Info */}
      <View className="items-center mb-2">
        <Text
          className="text-2xl font-bold text-white mb-1 text-center"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
        <Text
          className="text-base text-white text-center"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {email}
        </Text>
      </View>
    </LinearGradient>
  );
}
