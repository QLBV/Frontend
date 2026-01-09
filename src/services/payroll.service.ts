import api from '@/lib/api'

export interface Payroll {
  id: number
  employeeId: number
  employee?: {
    id: number
    fullName: string
    employeeCode?: string
    role: string
  }
  month: string
  baseSalary: number
  coefficient: number
  experience: number
  commission?: number
  totalAppointments?: number
  totalSalary: number
  status: 'DRAFT' | 'APPROVED' | 'PAID'
  approvedBy?: number
  approvedAt?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface CalculatePayrollData {
  month: number
  year: number
  calculateAll?: boolean
  userId?: number
}

export interface PayrollListResponse {
  payrolls: Payroll[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class PayrollService {
  /**
   * Calculate payroll
   */
  static async calculatePayroll(data: CalculatePayrollData): Promise<Payroll[]> {
    try {
      const response = await api.post('/payrolls/calculate', data)
      if (response.data.success) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to calculate payroll')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get all payrolls
   */
  static async getPayrolls(params?: {
    page?: number
    limit?: number
    month?: string
    employeeId?: number
    status?: string
  }): Promise<PayrollListResponse> {
    try {
      const response = await api.get('/payrolls', { params })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch payrolls')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get payroll by ID
   */
  static async getPayrollById(id: number): Promise<Payroll> {
    try {
      const response = await api.get(`/payrolls/${id}`)
      if (response.data.success) {
        const payroll = response.data.data
        // Map Backend fields to Frontend interface and convert strings to numbers
        return {
          ...payroll,
          // Map netSalary to totalSalary (Backend uses netSalary, Frontend expects totalSalary)
          totalSalary: typeof payroll.netSalary === 'string' ? parseFloat(payroll.netSalary) : (payroll.netSalary || payroll.totalSalary || 0),
          // Convert DECIMAL strings to numbers
          baseSalary: typeof payroll.baseSalary === 'string' ? parseFloat(payroll.baseSalary) : (payroll.baseSalary || 0),
          commission: typeof payroll.commission === 'string' ? parseFloat(payroll.commission) : (payroll.commission || 0),
          coefficient: typeof payroll.roleCoefficient === 'string' ? parseFloat(payroll.roleCoefficient) : (payroll.roleCoefficient || payroll.coefficient || 0),
          experience: typeof payroll.yearsOfService === 'string' ? parseInt(payroll.yearsOfService) : (payroll.yearsOfService || payroll.experience || 0),
          // Format month as string (e.g., "2025-01")
          month: payroll.month && payroll.year ? `${payroll.year}-${String(payroll.month).padStart(2, '0')}` : payroll.month || '',
        }
      }
      throw new Error(response.data.message || 'Failed to fetch payroll')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get payrolls by employee ID
   */
  static async getPayrollsByEmployee(employeeId: number, params?: {
    page?: number
    limit?: number
  }): Promise<PayrollListResponse> {
    try {
      const response = await api.get(`/payrolls/employee/${employeeId}`, { params })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch employee payrolls')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get payrolls by month
   */
  static async getPayrollsByMonth(month: string, params?: {
    page?: number
    limit?: number
  }): Promise<PayrollListResponse> {
    try {
      const response = await api.get(`/payrolls/month/${month}`, { params })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch monthly payrolls')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Approve payroll
   */
  static async approvePayroll(id: number): Promise<Payroll> {
    try {
      const response = await api.put(`/payrolls/${id}/approve`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to approve payroll')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Mark payroll as paid
   */
  static async payPayroll(id: number): Promise<Payroll> {
    try {
      const response = await api.put(`/payrolls/${id}/pay`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to mark payroll as paid')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Export payroll as PDF
   */
  static async exportPayrollPDF(id: number): Promise<Blob> {
    try {
      const response = await api.get(`/payrolls/${id}/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get payroll statistics
   */
  static async getPayrollStatistics(params?: {
    month?: number
    year?: number
  }): Promise<any> {
    try {
      const response = await api.get('/payrolls/statistics', { params })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch payroll statistics')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get payrolls by period (month/year)
   */
  static async getPayrollsByPeriod(params: {
    month: number
    year: number
    page?: number
    limit?: number
  }): Promise<PayrollListResponse> {
    try {
      const response = await api.get('/payrolls/period', { params })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch payrolls by period')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get payrolls by doctor ID
   */
  static async getDoctorPayrolls(doctorId: number, params?: {
    page?: number
    limit?: number
  }): Promise<Payroll[]> {
    try {
      const response = await api.get(`/payrolls/doctor/${doctorId}`, { params })
      if (response.data.success) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch doctor payrolls')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get user payroll history
   */
  static async getUserPayrollHistory(userId: number, params?: {
    page?: number
    limit?: number
  }): Promise<Payroll[]> {
    try {
      const response = await api.get(`/payrolls/user/${userId}`, { params })
      if (response.data.success) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch user payroll history')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Get my payrolls (current user)
   */
  static async getMyPayrolls(): Promise<Payroll[]> {
    try {
      const response = await api.get('/payrolls/my')
      if (response.data.success) {
        const payrolls = response.data.data || []
        // Map Backend fields to Frontend interface and convert strings to numbers
        return payrolls.map((p: any) => ({
          ...p,
          // Map netSalary to totalSalary (Backend uses netSalary, Frontend expects totalSalary)
          totalSalary: typeof p.netSalary === 'string' ? parseFloat(p.netSalary) : (p.netSalary || p.totalSalary || 0),
          // Convert DECIMAL strings to numbers
          baseSalary: typeof p.baseSalary === 'string' ? parseFloat(p.baseSalary) : (p.baseSalary || 0),
          commission: typeof p.commission === 'string' ? parseFloat(p.commission) : (p.commission || 0),
          coefficient: typeof p.roleCoefficient === 'string' ? parseFloat(p.roleCoefficient) : (p.roleCoefficient || p.coefficient || 0),
          experience: typeof p.yearsOfService === 'string' ? parseInt(p.yearsOfService) : (p.yearsOfService || p.experience || 0),
          // Format month as string (e.g., "2025-01")
          month: p.month && p.year ? `${p.year}-${String(p.month).padStart(2, '0')}` : p.month || '',
        }))
      }
      throw new Error(response.data.message || 'Failed to fetch my payrolls')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }
}
