// utils/address-helpers.ts

// Types
export interface Location {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  label: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Format tanggal
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Get icon berdasarkan label
export const getLabelIcon = (label: string): string => {
  const labelLower = label.toLowerCase();

  const iconMap: Record<string, string> = {
    home: "home",
    work: "briefcase",
    office: "briefcase",
    gym: "fitness",
    school: "school",
    other: "location",
  };

  return iconMap[labelLower] || "location";
};

// Format koordinat
export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

// Validasi lokasi
export const validateLocation = (location: Partial<Location>): string[] => {
  const errors: string[] = [];

  if (!location.address?.trim()) {
    errors.push("Address is required");
  }

  if (location.latitude === undefined || location.longitude === undefined) {
    errors.push("Coordinates are required");
  }

  if (!location.label?.trim()) {
    errors.push("Label is required");
  }

  return errors;
};

// Filter dan sort locations
export const processLocations = (
  locations: Location[],
  sortBy: "default" | "date" | "label" = "default"
): Location[] => {
  const sorted = [...locations];

  switch (sortBy) {
    case "date":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case "label":
      return sorted.sort((a, b) => a.label.localeCompare(b.label));

    case "default":
    default:
      return sorted.sort((a, b) => {
        // Default locations first, then by date
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }
};
