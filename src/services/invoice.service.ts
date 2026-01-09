import api from '@/lib/api'

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  QR_CODE = "QR_CODE",
}

export interface InvoiceItem {
  id: number
  invoiceId: number
  itemType: "EXAMINATION" | "MEDICINE"
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
  medicineId?: number
  createdAt?: string
  updatedAt?: string
}

export interface Payment {
  id: number
  invoiceId: number
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: string
  reference?: string
  note?: string
  createdBy: number
  creator?: {
    id: number
    fullName: string
    email: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface Invoice {
  id: number
  invoiceCode: string
  visitId: number
  patientId: number
  doctorId: number
  examinationFee: number
  medicineTotalAmount: number
  discount: number
  totalAmount: number
  paymentStatus: PaymentStatus
  paidAmount: number
  note?: string
  createdBy: number
  createdAt: string
  updatedAt: string
  // Relations
  visit?: {
    id: number
    visitDate: string
    symptoms?: string
    diagnosis?: string
  }
  patient?: {
    id: number
    fullName: string
    patientCode?: string
    phoneNumber?: string
    email?: string
  }
  doctor?: {
    id: number
    fullName: string
    specialty?: string
  }
  creator?: {
    id: number
    fullName: string
    email: string
  }
  items?: InvoiceItem[]
  payments?: Payment[]
}

export interface InvoiceListResponse {
  success: boolean
  message?: string
  data: Invoice[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface InvoiceStatistics {
  totalRevenue: number
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
  partiallyPaidInvoices: number
  averageInvoiceAmount: number
  revenueByDate?: Array<{
    date: string
    revenue: number
    count: number
  }>
  revenueByDoctor?: Array<{
    doctorId: number
    doctorName: string
    revenue: number
    count: number
  }>
}

export interface CreateInvoiceData {
  visitId: number
  examinationFee: number
}

export interface UpdateInvoiceData {
  discount?: number
  note?: string
}

export interface AddPaymentData {
  amount: number
  paymentMethod: PaymentMethod
  reference?: string
  note?: string
}

// API service for invoice operations
export class InvoiceService {
  
  // Create invoice from visit
  static async createInvoice(data: CreateInvoiceData): Promise<{ success: boolean; message?: string; data: Invoice }> {
    try {
      const response = await api.post('/invoices', data)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Get invoices with filters
  static async getInvoices(filters?: {
    page?: number
    limit?: number
    patientId?: number
    doctorId?: number
    paymentStatus?: PaymentStatus
    fromDate?: string
    toDate?: string
  }): Promise<InvoiceListResponse> {
    try {
      const params = new URLSearchParams()
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.patientId) params.append('patientId', filters.patientId.toString())
      if (filters?.doctorId) params.append('doctorId', filters.doctorId.toString())
      if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
      if (filters?.fromDate) params.append('fromDate', filters.fromDate)
      if (filters?.toDate) params.append('toDate', filters.toDate)

      const response = await api.get(`/invoices?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Get invoice by ID
  static async getInvoiceById(id: number): Promise<{ success: boolean; message?: string; data: Invoice }> {
    try {
      const response = await api.get(`/invoices/${id}`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Update invoice
  static async updateInvoice(id: number, data: UpdateInvoiceData): Promise<{ success: boolean; message?: string; data: Invoice }> {
    try {
      const response = await api.put(`/invoices/${id}`, data)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Add payment to invoice
  static async addPayment(id: number, data: AddPaymentData): Promise<{ success: boolean; message?: string; data: Invoice }> {
    try {
      const response = await api.post(`/invoices/${id}/payments`, data)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Get invoice payments
  static async getInvoicePayments(id: number): Promise<{ success: boolean; message?: string; data: Payment[] }> {
    try {
      const response = await api.get(`/invoices/${id}/payments`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Export invoice as PDF
  static async exportInvoicePDF(id: number): Promise<Blob> {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Get invoices by patient
  static async getInvoicesByPatient(patientId: number): Promise<{ success: boolean; message?: string; data: Invoice[] }> {
    try {
      const response = await api.get(`/invoices/patient/${patientId}`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Get unpaid invoices
  static async getUnpaidInvoices(limit?: number): Promise<InvoiceListResponse> {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())

      const response = await api.get(`/invoices/unpaid?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Get invoice statistics
  static async getInvoiceStatistics(filters?: {
    fromDate?: string
    toDate?: string
    doctorId?: number
  }): Promise<{ success: boolean; message?: string; data: InvoiceStatistics }> {
    try {
      const params = new URLSearchParams()
      if (filters?.fromDate) params.append('fromDate', filters.fromDate)
      if (filters?.toDate) params.append('toDate', filters.toDate)
      if (filters?.doctorId) params.append('doctorId', filters.doctorId.toString())

      const response = await api.get(`/invoices/statistics?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }
}
