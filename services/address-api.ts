// services/address-api.ts
import { authClient } from "@/lib/auth-client";
import { ApiResponse, Location } from "@/utils/address-helpers";

const API_BASE = "/api/locations";

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const cookies = authClient.getCookie();

    if (!cookies) {
      throw new Error("No session found. Please sign in again.");
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
        ...options.headers,
      },
      credentials: "omit",
    });

    const result: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `API Error: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    throw error;
  }
}

// Location API Service
export const locationApi = {
  // GET: Fetch all locations
  async getAll(): Promise<Location[]> {
    const response = await apiFetch<Location[]>("");
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch locations");
    }
    return response.data;
  },

  // POST: Create new location
  async create(
    locationData: Omit<Location, "id" | "createdAt">
  ): Promise<Location> {
    const response = await apiFetch<Location>("", {
      method: "POST",
      body: JSON.stringify(locationData),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to create location");
    }
    return response.data;
  },

  // DELETE: Remove location
  async delete(id: string): Promise<void> {
    const response = await apiFetch<void>(`?id=${id}`, {
      method: "DELETE",
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to delete location");
    }
  },
};
