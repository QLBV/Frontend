import api from '@/lib/api'

export interface LandingStats {
  patientCount: number
  doctorCount: number
  visitCount: number
  experienceYears: number
  satisfactionRate: number
}

export class PublicService {
  /**
   * Send contact message
   */
  static async sendContactMessage(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/contact', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn',
      };
    }
  }

  /**
   * Get stats for landing page
   */
  static async getLandingStats(): Promise<LandingStats> {
    try {
      const response = await api.get('/dashboard/public/landing-stats')
      if (response.data.success) {
        return response.data.data
      }
      return {
        patientCount: 0,
        doctorCount: 0,
        visitCount: 0,
        experienceYears: 15,
        satisfactionRate: 98
      }
    } catch (error) {
      console.error("Failed to fetch landing stats:", error)
      return {
        patientCount: 0,
        doctorCount: 0,
        visitCount: 0,
        experienceYears: 15,
        satisfactionRate: 98
      }
    }
  }
}
