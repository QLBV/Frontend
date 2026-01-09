import api from '@/lib/api'

export interface Specialty {
  id: number
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Doctor {
  id: number
  doctorCode: string
  userId: number
  specialtyId: number
  position?: string
  degree?: string
  user?: {
    id: number
    fullName: string
    email: string
  }
}

export class SpecialtyService {
  /**
   * Get all specialties
   */
  static async getSpecialties(): Promise<Specialty[]> {
    try {
      const response = await api.get('/specialties')
      if (response.data.success) {
        return response.data.data || []
      }
      return []
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      // Silent fail - return empty array
      return []
    }
  }

  /**
   * Get doctors by specialty ID
   */
  static async getDoctorsBySpecialty(specialtyId: number): Promise<Doctor[]> {
    try {
      const response = await api.get(`/specialties/${specialtyId}/doctors`)
      
      if (response.data.success) {
        const data = response.data.data
        // Backend returns: { success: true, data: { specialty: {...}, doctors: [...], count: ... } }
        // So we need to extract doctors from data.doctors
        if (data && typeof data === 'object' && 'doctors' in data) {
          return Array.isArray(data.doctors) ? data.doctors : []
        }
        // Fallback: if data is directly an array
        if (Array.isArray(data)) {
          return data
        }
        return []
      }
      return []
    } catch (error: any) {
      console.error("❌ Error in getDoctorsBySpecialty:", error)
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      // Silent fail - return empty array
      return []
    }
  }
}
