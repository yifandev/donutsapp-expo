import {
  ProfileHeader,
  ProfileMenuItem,
  ProfileSection,
  ProfileStats,
} from "@/components/profile";
import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";

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

export default function ProfileScreen() {
  const { data: session, isPending } = authClient.useSession();
  const [refreshing, setRefreshing] = useState(false);

  // Cast user to proper type
  const user = session?.user as User | undefined;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh session data
      await authClient.getSession();
    } catch (err) {
      console.error("Failed to refresh:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLogout = async () => {
    Alert.alert("Keluar", "Apakah Anda yakin ingin keluar?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          try {
            await authClient.signOut();

            // Tampilkan notifikasi sukses
            Toast.show({
              type: "success",
              text1: "Berhasil Keluar",
              text2: "Anda telah berhasil keluar dari akun",
              visibilityTime: 3000,
              autoHide: true,
            });
          } catch (error) {
            console.error("Logout error:", error);
            // Tampilkan notifikasi error
            Toast.show({
              type: "error",
              text1: "Gagal Keluar",
              text2: "Terjadi kesalahan saat mencoba keluar",
              visibilityTime: 4000,
              autoHide: true,
            });

            Alert.alert("Error", "Gagal keluar dari akun");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hapus Akun",
      "Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              // Implement account deletion using Better Auth
              const result = await authClient.deleteUser({
                callbackURL: "/sign-in",
              });

              if (result.error) {
                Toast.show({
                  type: "error",
                  text1: "Gagal Menghapus Akun",
                  text2: result.error.message || "Silakan coba lagi nanti",
                });
                return;
              }

              // Tampilkan notifikasi sukses
              Toast.show({
                type: "success",
                text1: "Akun Berhasil Dihapus",
                text2: "Akun Anda telah berhasil dihapus",
                visibilityTime: 3000,
                autoHide: true,
              });
            } catch (err) {
              console.error("Delete account error:", err);

              Toast.show({
                type: "error",
                text1: "Terjadi Kesalahan",
                text2: "Gagal menghapus akun. Silakan coba lagi.",
                visibilityTime: 4000,
                autoHide: true,
              });
            }
          },
        },
      ]
    );
  };

  // Cek error dengan getSession untuk melihat jika ada error
  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Ionicons name="person-circle-outline" size={64} color="#6D2F13" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#C25322" />
        <View className="mt-4 text-center">
          <Text className="text-gray-600">Gagal memuat profil</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 ">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6D2F13"
            colors={["#6D2F13"]}
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          name={user.name}
          email={user.email}
          image={user.image || undefined}
          onEditPress={() => router.push("/user/edit-profile")}
        />

        {/* Profile Stats */}
        <ProfileStats
          ordersCount={0}
          memberSince={user.createdAt.toISOString()}
        />

        {/* Account Section */}
        <ProfileSection title="Akun">
          <ProfileMenuItem
            icon="person-outline"
            title="Edit Profil"
            subtitle="Ubah nama dan foto profil"
            onPress={() => router.push("/user/edit-profile")}
          />
          <View className="h-px bg-gray-100 ml-16 " />
          <ProfileMenuItem
            icon="mail-outline"
            title="Email"
            subtitle={user.email}
            onPress={() => {}}
            showChevron={false}
          />
          <View className="h-px bg-gray-100 ml-16" />
          <ProfileMenuItem
            icon="call-outline"
            title="Nomor Telepon"
            subtitle={user.phoneNumber || "Belum diatur"}
            onPress={() => router.push("/user/edit-profile")}
          />
        </ProfileSection>

        {/* App Settings Section */}
        <ProfileSection title="Pengaturan">
          <ProfileMenuItem
            icon="location-outline"
            title="Lokasi Saya"
            subtitle="Kelola alamat pengiriman"
            onPress={() => router.push("/user/address-list")}
          />
          <View className="h-px bg-gray-100 ml-16" />
          <ProfileMenuItem
            icon="notifications-outline"
            title="Notifikasi"
            subtitle="Atur preferensi notifikasi"
            onPress={() => Alert.alert("Info", "Fitur segera hadir")}
          />
          <View className="h-px bg-gray-100 ml-16" />
          <ProfileMenuItem
            icon="language-outline"
            title="Bahasa"
            subtitle="Indonesia"
            onPress={() => Alert.alert("Info", "Fitur segera hadir")}
          />
        </ProfileSection>

        {/* Support Section */}
        <ProfileSection title="Bantuan & Dukungan">
          <ProfileMenuItem
            icon="help-circle-outline"
            title="Pusat Bantuan"
            subtitle="FAQ dan panduan penggunaan"
            onPress={() => Alert.alert("Info", "Fitur segera hadir")}
          />
          <View className="h-px bg-gray-100 ml-16" />
          <ProfileMenuItem
            icon="chatbubbles-outline"
            title="Hubungi Kami"
            subtitle="Customer service 24/7"
            onPress={() => Alert.alert("Info", "Fitur segera hadir")}
          />
          <View className="h-px bg-gray-100 ml-16" />
          <ProfileMenuItem
            icon="document-text-outline"
            title="Syarat & Ketentuan"
            subtitle="Kebijakan layanan"
            onPress={() => Alert.alert("Info", "Fitur segera hadir")}
          />
        </ProfileSection>

        {/* Danger Zone */}
        <ProfileSection title="Zona Berbahaya">
          <ProfileMenuItem
            icon="log-out-outline"
            title="Keluar"
            subtitle="Keluar dari akun Anda"
            onPress={handleLogout}
            danger
          />
          <View className="h-px bg-red-100 ml-16" />
          <ProfileMenuItem
            icon="trash-outline"
            title="Hapus Akun"
            subtitle="Hapus akun secara permanen"
            onPress={handleDeleteAccount}
            danger
          />
        </ProfileSection>

        {/* Version Info */}
        <View className="py-6 items-center">
          <Text className="text-xs text-gray-400">Donuts App v1.0.0</Text>
          <Text className="text-xs text-gray-400 mt-1">
            © 2024 Donuts. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
