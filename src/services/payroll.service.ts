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
  year?: number
  
  // Salary Components
  baseSalary: number
  coefficient: number
  roleSalary: number
  experience: number
  experienceBonus: number
  
  // Commission (Doctors)
  commission?: number
  commissionRate?: number
  totalInvoices?: number
  totalAppointments?: number // Keep for backward compatibility if needed, but totalInvoices is the new one
  
  // Deductions
  daysOff: number
  allowedDaysOff: number
  penaltyDaysOff: number
  penaltyAmount: number
  
  // Totals
  grossSalary: number
  netSalary: number
  totalSalary: number // Alias for netSalary for frontend consistency

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
  // Helper to map backend data to frontend interface
  private static mapPayrollData(p: any): Payroll {
    return {
      ...p,
      // Map netSalary to totalSalary (Frontend often expects totalSalary)
      totalSalary: typeof p.netSalary === 'string' ? parseFloat(p.netSalary) : (p.netSalary || 0),
      grossSalary: typeof p.grossSalary === 'string' ? parseFloat(p.grossSalary) : (p.grossSalary || 0),
      netSalary: typeof p.netSalary === 'string' ? parseFloat(p.netSalary) : (p.netSalary || 0),
      
      // Convert DECIMAL strings to numbers
      baseSalary: typeof p.baseSalary === 'string' ? parseFloat(p.baseSalary) : (p.baseSalary || 0),
      roleSalary: typeof p.roleSalary === 'string' ? parseFloat(p.roleSalary) : (p.roleSalary || 0),
      experienceBonus: typeof p.experienceBonus === 'string' ? parseFloat(p.experienceBonus) : (p.experienceBonus || 0),
      
      commission: typeof p.commission === 'string' ? parseFloat(p.commission) : (p.commission || 0),
      commissionRate: typeof p.commissionRate === 'string' ? parseFloat(p.commissionRate) : (p.commissionRate || 0),
      totalInvoices: typeof p.totalInvoices === 'string' ? parseFloat(p.totalInvoices) : (p.totalInvoices || 0),
      
      penaltyAmount: typeof p.penaltyAmount === 'string' ? parseFloat(p.penaltyAmount) : (p.penaltyAmount || 0),
      
      coefficient: typeof p.roleCoefficient === 'string' ? parseFloat(p.roleCoefficient) : (p.roleCoefficient || p.coefficient || 0),
      experience: typeof p.yearsOfService === 'string' ? parseInt(p.yearsOfService) : (p.yearsOfService || p.experience || 0),
      
      daysOff: typeof p.daysOff === 'string' ? parseInt(p.daysOff) : (p.daysOff || 0),
      allowedDaysOff: typeof p.allowedDaysOff === 'string' ? parseInt(p.allowedDaysOff) : (p.allowedDaysOff || 0),
      penaltyDaysOff: typeof p.penaltyDaysOff === 'string' ? parseInt(p.penaltyDaysOff) : (p.penaltyDaysOff || 0),

      // Format month as string (e.g., "2025-01") for display
      month: p.month && p.year ? `${p.year}-${String(p.month).padStart(2, '0')}` : p.month || '',
      // Map user to employee if needed
      employee: p.user ? {
        id: p.user.id,
        fullName: p.user.fullName,
        employeeCode: p.user.employee?.employeeCode || `NV${p.user.id}`, // Get from nested employee or fallback
        role: (p.user.role?.roleName || (
          p.user.roleId === 1 ? "admin" :
          p.user.roleId === 2 ? "receptionist" :
          p.user.roleId === 4 ? "doctor" : "employee"
        )).toLowerCase()
      } : p.employee
    }
  }

  /**
   * Calculate payroll
   */
  static async calculatePayroll(data: CalculatePayrollData): Promise<Payroll[]> {
    try {
      const response = await api.post('/payrolls/calculate', data)
      if (response.data.success) {
        const data = response.data.data
        if (Array.isArray(data)) {
          return data.map(PayrollService.mapPayrollData)
        } else if (data && data.payrolls) {
           // Case when calculateAll returns object with stats
           return []
        } else if (data && typeof data === 'object') {
           // Single object
           return [PayrollService.mapPayrollData(data)]
        }
        return []
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
        return {
          ...response.data.data, // pagination fields if any
          payrolls: (Array.isArray(response.data.data) ? response.data.data : response.data.data.payrolls || []).map(PayrollService.mapPayrollData)
        }
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
        return PayrollService.mapPayrollData(response.data.data)
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
        const data = response.data.data
         // Check structure
         if (Array.isArray(data)) {
           return { payrolls: data.map(PayrollService.mapPayrollData), total: data.length, page: 1, limit: data.length, totalPages: 1 }
         }
         return {
           ...data,
           payrolls: (data.payrolls || []).map(PayrollService.mapPayrollData)
         }
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
         const data = response.data.data
         if (Array.isArray(data)) {
           return { payrolls: data.map(PayrollService.mapPayrollData), total: data.length, page: 1, limit: data.length, totalPages: 1 }
         }
         return {
           ...data,
           payrolls: (data.payrolls || []).map(PayrollService.mapPayrollData)
         }
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
        return PayrollService.mapPayrollData(response.data.data)
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
        return PayrollService.mapPayrollData(response.data.data)
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
   * Export multiple payrolls as Excel
   */
  static async exportPayrollsExcel(params: { month: number, year: number, status?: string }): Promise<Blob> {
    try {
      const response = await api.get('/payrolls/export/excel', {
        params,
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
   * Export multiple payrolls as PDF (Summary Table)
   */
  static async exportPayrollsPDF(params: { month: number, year: number, status?: string }): Promise<Blob> {
    try {
      const response = await api.get('/payrolls/export/pdf', {
        params,
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
        const data = response.data.data
        // Handle both array format and object with payrolls format
        const payrolls = Array.isArray(data) ? data : (data.payrolls || [])
        // IMPORTANT: Map backend fields to frontend interface
        return {
           payrolls: payrolls.map(PayrollService.mapPayrollData),
           pagination: data.pagination || {},
           total: data.pagination?.total || payrolls.length,
           page: data.pagination?.page || 1,
           limit: data.pagination?.limit || payrolls.length,
           totalPages: data.pagination?.totalPages || 1
        } as any
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
        return (response.data.data || []).map(PayrollService.mapPayrollData)
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
        return (response.data.data || []).map(PayrollService.mapPayrollData)
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
        return (response.data.data || []).map(PayrollService.mapPayrollData)
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
