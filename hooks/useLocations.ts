import { locationApi } from "@/services/address-api";
import { Location } from "@/utils/address-helpers";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch locations
  const fetchLocations = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await locationApi.getAll();
      setLocations(data);
    } catch (error: any) {
      console.error("Failed to fetch locations:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Load",
        text2: error.message || "Could not load your saved locations.",
      });
      throw error;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Add new location
  const addLocation = useCallback(
    async (locationData: Omit<Location, "id" | "createdAt">) => {
      try {
        const newLocation = await locationApi.create(locationData);
        setLocations((prev) => [newLocation, ...prev]);

        Toast.show({
          type: "success",
          text1: "Lokasi Tersimpan",
          text2: "Lokasi Anda telah berhasil disimpan",
        });

        return newLocation;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Save Failed",
          text2: error.message || "Could not save location",
        });
        throw error;
      }
    },
    []
  );

  // Delete location
  const deleteLocation = useCallback(async (id: string) => {
    try {
      await locationApi.delete(id);

      setLocations((prev) => prev.filter((loc) => loc.id !== id));

      Toast.show({
        type: "success",
        text1: "Lokasi Dihapus",
        text2: "Lokasi Anda telah berhasil dihapus",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: error.message || "Could not delete location",
      });
      throw error;
    }
  }, []);

  return {
    locations,
    loading,
    refreshing,
    selectedId,
    setSelectedId,
    fetchLocations,
    addLocation,
    deleteLocation,
  };
};
