import api from '@/lib/api'
import type { Doctor } from './specialty.service' // Reuse interface or define new one

export interface PublicDoctor extends Doctor {
  user: {
    id: number
    fullName: string
    email: string
    avatar?: string
  }
  specialty: {
    id: number
    name: string
  }
}

export class DoctorService {
  /**
   * Get all doctors (public)
   */
  static async getPublicDoctors(): Promise<PublicDoctor[]> {
    try {
      const response = await api.get('/doctors/public-list')
      if (response.data.success) {
        return response.data.data
      }
      return []
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.warn('Rate limited while fetching doctors')
      }
      console.error('Failed to fetch public doctors:', error)
      return []
    }
  }
}
