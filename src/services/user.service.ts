import api from '@/lib/api'

export interface User {
  id: number
  fullName: string
  email: string
  phone?: string
  avatar?: string
  role: 'admin' | 'doctor' | 'receptionist' | 'patient'
  isActive: boolean
  createdAt: string
  updatedAt: string
  doctor?: {
    id: number
    doctorCode: string
    specialty?: {
      id: number
      name: string
    }
  }
  patient?: {
    id: number
    patientCode: string
  }
  employee?: {
    id: number
    employeeCode: string
    position?: string
    degree?: string
    specialty?: {
      id: number
      name: string
    }
  }
}

export interface CreateUserData {
  fullName: string
  email: string
  password: string
  phone?: string
  role: 'admin' | 'doctor' | 'receptionist' | 'patient'
  doctorData?: {
    specialtyId: number
    position?: string
    degree?: string
  }
}

export interface UpdateUserData {
  fullName?: string
  email?: string
  phone?: string
  avatar?: string
  role?: 'admin' | 'doctor' | 'receptionist' | 'patient'
}

export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  appointmentReminders: boolean
  prescriptionReady: boolean
  invoicePaid: boolean
}

export interface UserListResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class UserService {
  /**
   * Get all users with pagination
   */
  static async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    isActive?: boolean
  }): Promise<UserListResponse> {
    try {
      const response = await api.get('/users', { params })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch users')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch user')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Create new user
   */
  static async createUser(data: CreateUserData): Promise<User> {
    try {
      const roleMap: Record<string, number> = {
        admin: 1,
        receptionist: 2,
        patient: 3,
        doctor: 4,
      }
      
      const payload = {
        ...data,
        roleId: roleMap[data.role] || 3 // Default to patient
      }
      
      const response = await api.post('/users', payload)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to create user')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: number, data: UpdateUserData): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, data)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to update user')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Activate user
   */
  static async activateUser(id: number): Promise<void> {
    try {
      const response = await api.put(`/users/${id}/activate`)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to activate user')
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(id: number): Promise<void> {
    try {
      const response = await api.put(`/users/${id}/deactivate`)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to deactivate user')
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Change user role
   */
  static async changeUserRole(id: number, role: 'admin' | 'doctor' | 'receptionist' | 'patient'): Promise<User> {
    try {
      const response = await api.put(`/users/${id}/role`, { role })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to change user role')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: number): Promise<void> {
    try {
      const response = await api.delete(`/users/${id}`)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete user')
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get notification settings for current user
   */
  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await api.get('/users/me/notification-settings')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch notification settings')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Update notification settings for current user
   */
  static async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    try {
      const response = await api.put('/users/me/notification-settings', settings)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to update notification settings')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Upload user avatar
   */
  static async uploadUserAvatar(userId: number, file: File): Promise<{ avatar: string }> {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.put(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        return response.data.data || { avatar: response.data.avatar }
      }
      throw new Error(response.data.message || 'Failed to upload avatar')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }
}
