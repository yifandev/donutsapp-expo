import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

type UseImageOptions = {
  cloudName?: string;
  uploadPreset?: string;
};

type UseImageReturn = {
  image?: string;
  localUri?: string;
  uploading: boolean;
  pickFromGallery: () => Promise<void>;
  takePhoto: () => Promise<void>;
  deleteImage: () => void;
  setImage: (url?: string) => void;
};

/**
 * useImage
 * - pickFromGallery: open gallery and upload selected image to Cloudinary
 * - takePhoto: open camera and upload taken photo
 * - deleteImage: remove current image value (doesn't delete from Cloudinary)
 * - setImage: set image URL manually
 *
 * Expects Cloudinary credentials via env vars `CLOUDINARY_CLOUD_NAME` and
 * `CLOUDINARY_UPLOAD_PRESET` (or passed in options). Upload preset must allow unsigned uploads.
 */
export default function useImage(
  options: UseImageOptions = {}
): UseImageReturn {
  const cloudName =
    options.cloudName ?? process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    options.uploadPreset ?? process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const [image, setImage] = useState<string | undefined>(undefined);
  const [localUri, setLocalUri] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const ensureCloudConfig = useCallback(() => {
    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET."
      );
    }
  }, [cloudName, uploadPreset]);

  const uploadToCloudinary = useCallback(
    async (uri: string) => {
      ensureCloudConfig();
      setUploading(true);
      try {
        const filename = uri.split("/").pop() || `upload_${Date.now()}.jpg`;
        const match = filename.match(/\.(\w+)$/);
        const ext = match ? match[1] : "jpg";
        const type = `image/${ext === "jpg" ? "jpeg" : ext}`;

        const formData: any = new FormData();
        // RN FormData file object
        formData.append("file", {
          uri:
            Platform.OS === "android" && uri.startsWith("file://") ? uri : uri,
          name: filename,
          type,
        });
        formData.append("upload_preset", uploadPreset as string);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
        }

        const data = await res.json();
        const url = data.secure_url || data.url;
        setImage(url);
        setLocalUri(undefined);
        return url;
      } finally {
        setUploading(false);
      }
    },
    [cloudName, ensureCloudConfig, uploadPreset]
  );

  const pickFromGallery = useCallback(async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted)
        throw new Error("Permission to access gallery denied");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
      });

      if (result.canceled) return;

      if (!result.assets || result.assets.length === 0) return;

      const uri = result.assets[0].uri;
      setLocalUri(uri);
      await uploadToCloudinary(uri);
    } catch (err) {
      setLocalUri(undefined);
      setUploading(false);
      console.warn("useImage.pickFromGallery error:", err);
      throw err;
    }
  }, [uploadToCloudinary]);

  const takePhoto = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted)
        throw new Error("Permission to access camera denied");

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
      });

      if (result.canceled) return;

      if (!result.assets || result.assets.length === 0) return;

      const uri = result.assets[0].uri;
      setLocalUri(uri);
      await uploadToCloudinary(uri);
    } catch (err) {
      setLocalUri(undefined);
      setUploading(false);
      console.warn("useImage.takePhoto error:", err);
      throw err;
    }
  }, [uploadToCloudinary]);

  const deleteImage = useCallback(() => {
    setImage(undefined);
    setLocalUri(undefined);
  }, []);

  return {
    image,
    localUri,
    uploading,
    pickFromGallery,
    takePhoto,
    deleteImage,
    setImage: (url?: string) => setImage(url),
  };
}
