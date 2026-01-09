import api from "@/lib/api";
import type { UserProfile, UpdateProfileData, ChangePasswordData } from "@/types/profile.types";

export class ProfileService {
  /**
   * Get current user profile
   * GET /api/profile
   */
  static async getMyProfile(): Promise<UserProfile> {
    const response = await api.get("/profile");
    return response.data.data || response.data.user || response.data;
  }

  /**
   * Update current user profile
   * PUT /api/profile
   */
  static async updateMyProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.put("/profile", data);
    return response.data.data || response.data.user || response.data;
  }

  /**
   * Change password
   * PUT /api/profile/password
   */
  static async changePassword(data: ChangePasswordData): Promise<void> {
    await api.put("/profile/password", data);
  }

  /**
   * Upload avatar
   * POST /api/profile/avatar
   */
  static async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post("/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data || response.data;
  }
}
