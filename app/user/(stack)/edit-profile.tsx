import useImage from "@/hooks/useImage";
import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
}

export default function EditProfileModal() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Gunakan useImage hook
  const {
    image,
    localUri,
    uploading: imageUploading,
    pickFromGallery,
    takePhoto,
    deleteImage: deleteImageHook,
    setImage: setImageHook,
  } = useImage();

  // Get current user data
  const { data: session } = authClient.useSession();
  const user = session?.user as User | undefined;

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhoneNumber(user.phoneNumber || "");
      // Set image dari user ke hook useImage
      if (user.image) {
        setImageHook(user.image);
      }
      setInitialLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Nama tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      // Update user profile
      const updateData: Record<string, unknown> = {
        name: name.trim(),
        image: image?.trim() || null, // Gunakan image dari hook
      };

      if (phoneNumber.trim()) {
        updateData.phoneNumber = phoneNumber.trim();
      }

      await authClient.updateUser(updateData);

      Alert.alert("Berhasil", "Profil berhasil diperbarui", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading || imageUploading) return;
    router.back();
  };

  const handlePickImage = async () => {
    try {
      Alert.alert(
        "Pilih Foto",
        "Pilih sumber foto:",
        [
          {
            text: "Kamera",
            onPress: () => takePhoto(),
          },
          {
            text: "Galeri",
            onPress: () => pickFromGallery(),
          },
          {
            text: "Batal",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Failed to pick image:", error);
      Alert.alert("Error", "Gagal memilih gambar");
    }
  };

  const handleDeleteImage = () => {
    Alert.alert(
      "Hapus Foto Profil",
      "Apakah Anda yakin ingin menghapus foto profil?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteImageHook(); // Hapus dari hook
            // Juga set null ke database saat save
          },
        },
      ]
    );
  };

  const handleResetChanges = () => {
    setName(user?.name || "");
    setPhoneNumber(user?.phoneNumber || "");
    // Reset image ke nilai awal dari user
    if (user?.image) {
      setImageHook(user.image);
    } else {
      deleteImageHook();
    }
  };

  // Tampilkan loading saat mengupload gambar atau initial loading
  const isLoading = initialLoading || loading || imageUploading;

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#6D2F13" />
      </SafeAreaView>
    );
  }

  return (
    <>
      <LinearGradient
        colors={["#6D2F13", "#C25322"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View className="flex-row items-center justify-between px-4 py-4 mt-8 border-b border-gray-200">
          <Pressable onPress={handleClose} disabled={isLoading}>
            <Ionicons name="close" size={28} color="#EDECE3" />
          </Pressable>
          <Text className="text-xl font-bold text-muted">Edit Profil</Text>
          <Pressable
            onPress={handleSave}
            disabled={isLoading}
            className="active:opacity-70"
          >
            {isLoading ? (
              <ActivityIndicator color="#6D2F13" />
            ) : (
              <Text className="text-muted font-semibold text-base">Simpan</Text>
            )}
          </Pressable>
        </View>
      </LinearGradient>

      <View className="flex-1 bg-gray-50">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Profile Image Preview */}
          <View className="items-center py-8">
            <Pressable
              onPress={handlePickImage}
              disabled={isLoading}
              className="active:opacity-80"
            >
              <View className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden">
                {imageUploading ? (
                  <View className="w-full h-full items-center justify-center bg-gray-100">
                    <ActivityIndicator size="large" color="#6D2F13" />
                  </View>
                ) : image || localUri ? (
                  <Image
                    source={{ uri: localUri || image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-primary/10">
                    <Text className="text-primary text-5xl font-bold">
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
            <Text className="text-sm text-gray-500 mt-4">
              {imageUploading
                ? "Mengupload gambar..."
                : "Tekan gambar untuk mengganti"}
            </Text>
          </View>

          {/* Form Fields */}
          <View className="px-6 space-y-6 gap-y-4">
            {/* Name Field */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Nama Lengkap
              </Text>
              <View className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Masukkan nama lengkap"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-gray-800 text-base"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email Field (Read-only) */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Email
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  value={user?.email || ""}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-gray-500 text-base"
                  editable={false}
                />
              </View>
              <Text className="text-xs text-gray-500 mt-2">
                Email tidak dapat diubah
              </Text>
            </View>

            {/* Phone Number Field */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Nomor Telepon
              </Text>
              <View className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Masukkan nomor telepon"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  className="flex-1 ml-3 text-gray-800 text-base"
                  editable={!isLoading}
                />
              </View>
              <Text className="text-xs text-gray-500 mt-2">
                Contoh: +6281234567890
              </Text>
            </View>

            {/* Divider */}
            <View className="pt-4">
              <View className="h-px bg-gray-200" />
            </View>

            {/* Additional Actions */}
            <View className="space-y-4">
              <Pressable
                className="flex-row items-center justify-center py-3 bg-red-50 rounded-xl active:opacity-80"
                onPress={handleDeleteImage}
                disabled={isLoading || (!image && !localUri)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text className="text-red-600 font-medium ml-2">
                  Hapus Foto Profil
                </Text>
              </Pressable>

              <Pressable
                className="flex-row items-center justify-center py-3 bg-gray-50 rounded-xl active:opacity-80 mb-10 mt-2"
                onPress={handleResetChanges}
                disabled={isLoading}
              >
                <Ionicons name="refresh-outline" size={20} color="#6B7280" />
                <Text className="text-gray-700 font-medium ml-2">
                  Reset Perubahan
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
