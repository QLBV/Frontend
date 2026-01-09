export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  avatar?: string | null;
  patientId?: number | null;
  doctorId?: number | null;
  // Patient-specific
  patient?: {
    id: number;
    patientCode: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    cccd: string;
    avatar?: string | null;
    profiles?: Array<{
      type: string;
      value: string;
      city?: string;
      ward?: string;
    }>;
  };
  // Doctor-specific
  doctor?: {
    id: number;
    doctorCode: string;
    specialtyId: number;
    yearsOfExperience: number;
    bio?: string;
    specialty?: {
      id: number;
      name: string;
      code: string;
    };
  };
}

export interface UpdateProfileData {
  fullName?: string;
  email?: string;
  // Patient-specific fields (will be ignored for other roles)
  dateOfBirth?: string;
  gender?: string;
  cccd?: string;
  profiles?: Array<{
    type: string;
    value: string;
    city?: string;
    ward?: string;
  }>;
  // Doctor-specific fields
  bio?: string;
  yearsOfExperience?: number;
}
