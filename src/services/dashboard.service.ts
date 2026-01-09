import api from '@/lib/api'

export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  totalRevenue: number
  todayAppointments: number
  todayPatients: number
  todayRevenue: number
  pendingAppointments: number
  completedAppointments: number
}

export interface DashboardOverview {
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
    change: number
  }
  appointments: {
    today: number
    thisWeek: number
    thisMonth: number
    change: number
  }
  patients: {
    today: number
    thisWeek: number
    thisMonth: number
    change: number
  }
}

export interface AppointmentCalendar {
  date: string
  appointments: Array<{
    id: number
    patientName: string
    time: string
    status: string
    doctorName?: string
  }>
}

export interface RecentActivity {
  id: number
  type: 'appointment' | 'visit' | 'prescription' | 'invoice' | 'payment'
  description: string
  timestamp: string
  user?: {
    id: number
    fullName: string
  }
}

export interface QuickStats {
  lowStockMedicines: number
  expiringMedicines: number
  unpaidInvoices: number
  pendingAppointments: number
  todayVisits: number
}

export interface SystemAlert {
  id: number
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: string
  actionUrl?: string
}

export interface DashboardData {
  stats: DashboardStats
  overview: DashboardOverview
  recentActivities: RecentActivity[]
  quickStats: QuickStats
  alerts: SystemAlert[]
}

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  static async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/dashboard/stats')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard stats')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get dashboard overview
   */
  static async getOverview(): Promise<DashboardOverview> {
    try {
      const response = await api.get('/dashboard/overview')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard overview')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get appointments for a specific date
   */
  static async getAppointmentsByDate(date: string): Promise<AppointmentCalendar> {
    try {
      const response = await api.get(`/dashboard/appointments/${date}`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch appointments')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get recent activities
   */
  static async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await api.get('/dashboard/recent-activities', {
        params: { limit }
      })
      if (response.data.success) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch recent activities')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      // Silent fail for activities - return empty array
      return []
    }
  }

  /**
   * Get quick stats
   */
  static async getQuickStats(): Promise<QuickStats> {
    try {
      const response = await api.get('/dashboard/quick-stats')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch quick stats')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get system alerts
   */
  static async getAlerts(): Promise<SystemAlert[]> {
    try {
      const response = await api.get('/dashboard/alerts')
      if (response.data.success) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch alerts')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      // Silent fail for alerts - return empty array
      return []
    }
  }

  /**
   * Get all dashboard data at once
   */
  static async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get('/dashboard')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard data')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }
}
