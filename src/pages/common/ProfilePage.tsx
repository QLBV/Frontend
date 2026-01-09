import React, { useState, useEffect } from "react";
import { Camera, Save, Lock, Mail, User as UserIcon, Phone, MapPin, Calendar, X } from "lucide-react";
import { ProfileService } from "@/services/profile.service";
import type { UserProfile, UpdateProfileData, ChangePasswordData } from "@/types/profile.types";
import { useAuth } from "@/auth/authContext";
import { toast } from "sonner";

interface ProfilePageProps {
  role: "admin" | "doctor" | "patient" | "receptionist";
}

export default function ProfilePage({ role }: ProfilePageProps) {
  const { user: authUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  // Profile form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    // Patient-specific
    dateOfBirth: "",
    gender: "",
    cccd: "",
    phone: "",
    address: "",
    city: "",
    ward: "",
    // Doctor-specific
    bio: "",
    yearsOfExperience: 0,
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getMyProfile();
      setProfile(data);

      // Populate form with existing data
      setFormData({
        fullName: data.fullName || "",
        email: data.email || "",
        dateOfBirth: data.patient?.dateOfBirth?.split("T")[0] || "",
        gender: data.patient?.gender || "",
        cccd: data.patient?.cccd || "",
        phone: data.patient?.profiles?.find((p) => p.type === "phone")?.value || "",
        address: data.patient?.profiles?.find((p) => p.type === "address")?.value || "",
        city: data.patient?.profiles?.find((p) => p.type === "address")?.city || "",
        ward: data.patient?.profiles?.find((p) => p.type === "address")?.ward || "",
        bio: data.doctor?.bio || "",
        yearsOfExperience: data.doctor?.yearsOfExperience || 0,
      });

      // Set avatar preview
      if (data.avatar) {
        setAvatarPreview(`http://localhost:5000${data.avatar}`);
      } else if (data.patient?.avatar) {
        setAvatarPreview(`http://localhost:5000${data.patient.avatar}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ chấp nhận file ảnh");
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Upload avatar first if changed
      if (avatarFile) {
        await ProfileService.uploadAvatar(avatarFile);
        toast.success("Cập nhật avatar thành công");
      }

      // Prepare update data based on role
      const updateData: UpdateProfileData = {
        fullName: formData.fullName,
        email: formData.email,
      };

      if (role === "patient") {
        updateData.dateOfBirth = formData.dateOfBirth;
        updateData.gender = formData.gender;
        updateData.cccd = formData.cccd;
        updateData.profiles = [
          { type: "phone", value: formData.phone },
          {
            type: "address",
            value: formData.address,
            city: formData.city,
            ward: formData.ward,
          },
        ];
      } else if (role === "doctor") {
        updateData.bio = formData.bio;
        updateData.yearsOfExperience = formData.yearsOfExperience;
      }

      const updatedProfile = await ProfileService.updateMyProfile(updateData);
      setProfile(updatedProfile);

      // Update auth context by refreshing user data
      await refreshUser();

      toast.success("Cập nhật thông tin thành công");
      setAvatarFile(null); // Reset avatar file after successful upload
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }

      setSaving(true);
      await ProfileService.changePassword(passwordData);

      toast.success("Đổi mật khẩu thành công");

      // Reset password form
      setPasswordData({ currentPassword: "", newPassword: "" });
      setConfirmPassword("");
      setActiveTab("info");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý thông tin tài khoản và cài đặt của bạn
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "info"
              ? "bg-white text-primary shadow-sm border-2 border-primary"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <UserIcon size={18} className="inline mr-2" />
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "password"
              ? "bg-white text-primary shadow-sm border-2 border-primary"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Lock size={18} className="inline mr-2" />
          Đổi mật khẩu
        </button>
      </div>

      {/* Content */}
      {activeTab === "info" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  formData.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
              >
                <Camera size={16} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{formData.fullName}</h3>
              <p className="text-sm text-gray-500">{formData.email}</p>
              {role === "patient" && profile?.patient && (
                <p className="text-xs text-gray-400 mt-1">Mã BN: {profile.patient.patientCode}</p>
              )}
              {role === "doctor" && profile?.doctor && (
                <p className="text-xs text-gray-400 mt-1">Mã BS: {profile.doctor.doctorCode}</p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Common fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon size={16} className="inline mr-2" />
                Họ và tên
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nhập họ tên"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            {/* Patient-specific fields */}
            {role === "patient" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CCCD</label>
                  <input
                    type="text"
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nhập số CCCD"
                    maxLength={12}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-2" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Số nhà, tên đường"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="TP. HCM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã</label>
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Phường 1"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Doctor-specific fields */}
            {role === "doctor" && (
              <>
                {profile?.doctor?.specialty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên khoa</label>
                    <input
                      type="text"
                      value={profile.doctor.specialty.name}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số năm kinh nghiệm</label>
                  <input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={4}
                    placeholder="Giới thiệu ngắn về bản thân..."
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => window.history.back()}
                disabled={saving}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <X size={18} />
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Password Tab */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Đổi mật khẩu</h2>

          <div className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {/* Change Password Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleChangePassword}
                disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !confirmPassword}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Đổi mật khẩu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
