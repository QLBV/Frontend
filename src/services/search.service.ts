import api from '@/lib/api'
import type { Patient } from './patient.service'
import type { Appointment } from './appointment.service'
import type { Invoice } from './invoice.service'

export interface SearchPatientsFilters {
  keyword?: string
  profileKeyword?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  isActive?: boolean
  dateOfBirthFrom?: string
  dateOfBirthTo?: string
  createdFrom?: string
  createdTo?: string
  page?: number
  limit?: number
}

export interface SearchAppointmentsFilters {
  keyword?: string
  status?: string
  bookingType?: 'ONLINE' | 'OFFLINE'
  bookedBy?: 'PATIENT' | 'RECEPTIONIST'
  doctorId?: number
  patientId?: number
  shiftId?: number
  dateFrom?: string
  dateTo?: string
  createdFrom?: string
  createdTo?: string
  page?: number
  limit?: number
}

export interface SearchInvoicesFilters {
  keyword?: string
  invoiceCode?: string
  paymentStatus?: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID'
  patientId?: number
  doctorId?: number
  totalMin?: number
  totalMax?: number
  createdFrom?: string
  createdTo?: string
  page?: number
  limit?: number
}

export interface SearchResponse<T> {
  success: boolean
  message?: string
  data: T[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class SearchService {
  /**
   * Search patients with advanced filters
   */
  static async searchPatients(filters: SearchPatientsFilters): Promise<SearchResponse<Patient>> {
    try {
      const response = await api.post('/search/patients', filters)
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data || [],
          pagination: response.data.pagination,
        }
      }
      throw new Error(response.data.message || 'Failed to search patients')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Search appointments with advanced filters
   */
  static async searchAppointments(filters: SearchAppointmentsFilters): Promise<SearchResponse<Appointment>> {
    try {
      const response = await api.post('/search/appointments', filters)
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data || [],
          pagination: response.data.pagination,
        }
      }
      throw new Error(response.data.message || 'Failed to search appointments')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  /**
   * Search invoices with advanced filters
   */
  static async searchInvoices(filters: SearchInvoicesFilters): Promise<SearchResponse<Invoice>> {
    try {
      const response = await api.post('/search/invoices', filters)
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data || [],
          pagination: response.data.pagination,
        }
      }
      throw new Error(response.data.message || 'Failed to search invoices')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }
}
