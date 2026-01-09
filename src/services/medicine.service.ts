import api from '@/lib/api'

export enum MedicineUnit {
  VIEN = "VIEN",
  ML = "ML",
  HOP = "HOP",
  CHAI = "CHAI",
  TUYP = "TUYP",
  GOI = "GOI",
}

export enum MedicineStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  REMOVED = "REMOVED",
}

export interface Medicine {
  id: number
  medicineCode: string
  name: string
  group: string
  activeIngredient?: string
  manufacturer?: string
  unit: MedicineUnit
  importPrice: number
  salePrice: number
  quantity: number
  minStockLevel: number
  expiryDate: string
  description?: string
  status: MedicineStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateMedicineData {
  name: string
  group: string
  activeIngredient?: string
  manufacturer?: string
  unit: MedicineUnit
  importPrice: number
  salePrice: number
  quantity: number
  minStockLevel?: number
  expiryDate: string
  description?: string
}

export interface UpdateMedicineData {
  name?: string
  group?: string
  activeIngredient?: string
  manufacturer?: string
  unit?: MedicineUnit
  importPrice?: number
  salePrice?: number
  quantity?: number
  minStockLevel?: number
  expiryDate?: string
  description?: string
}

export interface MedicineListResponse {
  medicines: Medicine[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MedicineImport {
  id: number
  medicineId: number
  medicine?: Medicine
  quantity: number
  importPrice: number
  supplier?: string
  supplierInvoice?: string
  batchNumber?: string
  note?: string
  importedBy: number
  importer?: {
    id: number
    fullName: string
    email: string
  }
  createdAt: string
  updatedAt?: string
}

export interface MedicineExport {
  id: number
  medicineId: number
  medicine?: Medicine
  quantity: number
  exportedBy: number
  exporter?: {
    id: number
    fullName: string
    email: string
  }
  createdAt: string
  updatedAt?: string
}

export interface ImportExportListResponse {
  data: MedicineImport[] | MedicineExport[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class MedicineService {
  // Create medicine
  static async createMedicine(data: CreateMedicineData): Promise<Medicine> {
    const response = await api.post('/medicines', data)
    return response.data.data
  }

  // Get all medicines
  static async getMedicines(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<MedicineListResponse> {
    const response = await api.get('/medicines', { params })
    return response.data.data || response.data
  }

  // Get medicine by ID
  static async getMedicineById(id: number): Promise<Medicine> {
    const response = await api.get(`/medicines/${id}`)
    return response.data.data
  }

  // Update medicine
  static async updateMedicine(id: number, data: UpdateMedicineData): Promise<Medicine> {
    const response = await api.put(`/medicines/${id}`, data)
    return response.data.data
  }

  // Delete medicine
  static async deleteMedicine(id: number): Promise<void> {
    await api.delete(`/medicines/${id}`)
  }

  // Import medicine
  static async importMedicine(
    id: number,
    data: {
      quantity: number
      importPrice: number
      supplier?: string
      supplierInvoice?: string
      batchNumber?: string
      note?: string
    }
  ): Promise<MedicineImport> {
    const response = await api.post(`/medicines/${id}/import`, data)
    return response.data.data
  }

  // Export medicine
  static async exportMedicine(
    id: number,
    data: {
      quantity: number
    }
  ): Promise<MedicineExport> {
    const response = await api.post(`/medicines/${id}/export`, data)
    return response.data.data
  }

  // Get low stock medicines
  static async getLowStockMedicines(params?: {
    page?: number
    limit?: number
  }): Promise<MedicineListResponse> {
    const response = await api.get('/medicines/low-stock', { params })
    return response.data.data || response.data
  }

  // Get expiring medicines
  static async getExpiringMedicines(params?: {
    page?: number
    limit?: number
  }): Promise<MedicineListResponse> {
    const response = await api.get('/medicines/expiring', { params })
    return response.data.data || response.data
  }

  // Get medicine import history
  static async getMedicineImportHistory(id: number): Promise<MedicineImport[]> {
    const response = await api.get(`/medicines/${id}/imports`)
    return response.data.data || []
  }

  // Get medicine export history
  static async getMedicineExportHistory(id: number): Promise<MedicineExport[]> {
    const response = await api.get(`/medicines/${id}/exports`)
    return response.data.data || []
  }

  // Get all medicine imports
  static async getAllMedicineImports(params?: {
    page?: number
    limit?: number
  }): Promise<ImportExportListResponse> {
    const response = await api.get('/medicines/imports', { params })
    return response.data.data || response.data
  }

  // Get all medicine exports
  static async getAllMedicineExports(params?: {
    page?: number
    limit?: number
  }): Promise<ImportExportListResponse> {
    const response = await api.get('/medicines/exports', { params })
    return response.data.data || response.data
  }

  // Mark medicine as expired
  static async markMedicineAsExpired(id: number): Promise<Medicine> {
    const response = await api.post(`/medicines/${id}/mark-expired`)
    return response.data.data
  }

  // Auto-mark expired medicines
  static async autoMarkExpired(): Promise<{ count: number; medicines: Medicine[] }> {
    try {
      const response = await api.post('/medicines/auto-mark-expired')
      if (response.data.success) {
        return response.data.data || { count: 0, medicines: [] }
      }
      throw new Error(response.data.message || 'Failed to auto-mark expired medicines')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }
}
