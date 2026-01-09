import api from '@/lib/api'
import type { Prescription } from '@/types/prescription.types'

export interface PrescriptionApiResponse {
  success: boolean
  message?: string
  data?: any
}

// API service for prescription operations
export class PrescriptionService {
  
  // Get prescription by ID
  static async getPrescriptionById(id: number): Promise<PrescriptionApiResponse> {
    try {
      const response = await api.get(`/prescriptions/${id}`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Get prescriptions by patient ID
  static async getPrescriptionsByPatient(patientId: number): Promise<PrescriptionApiResponse> {
    try {
      const response = await api.get(`/prescriptions/patient/${patientId}`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Get prescription by visit ID
  static async getPrescriptionByVisit(visitId: number): Promise<PrescriptionApiResponse> {
    try {
      const response = await api.get(`/prescriptions/visit/${visitId}`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Create new prescription
  static async createPrescription(data: {
    visitId: number
    patientId: number
    medicines: Array<{
      medicineId: number
      quantity: number
      dosageMorning: number
      dosageNoon: number
      dosageAfternoon: number
      dosageEvening: number
      instruction: string
    }>
    note?: string
  }): Promise<PrescriptionApiResponse> {
    try {
      const response = await api.post('/prescriptions', data)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Update prescription
  static async updatePrescription(id: number, data: {
    medicines: Array<{
      medicineId: number
      quantity: number
      dosageMorning: number
      dosageNoon: number
      dosageAfternoon: number
      dosageEvening: number
      instruction: string
    }>
    note?: string
  }): Promise<PrescriptionApiResponse> {
    try {
      const response = await api.put(`/prescriptions/${id}`, data)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Cancel prescription
  static async cancelPrescription(id: number): Promise<PrescriptionApiResponse> {
    try {
      const response = await api.post(`/prescriptions/${id}/cancel`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Delete prescription (hard delete)
  static async deletePrescription(id: number): Promise<PrescriptionApiResponse> {
    try {
      const response = await api.delete(`/prescriptions/${id}`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Export prescription as PDF
  static async exportPrescriptionPDF(id: number): Promise<Blob> {
    try {
      const response = await api.get(`/prescriptions/${id}/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Dispense prescription (Receptionist/Admin)
  static async dispensePrescription(id: number): Promise<PrescriptionApiResponse> {
    try {
      const response = await api.put(`/prescriptions/${id}/dispense`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Transform API data to match frontend interface
  static transformPrescriptionData(apiData: any): Prescription {
    return {
      id: apiData.id,
      prescriptionCode: apiData.prescriptionCode,
      visitId: apiData.visitId,
      doctorId: apiData.doctorId,
      patientId: apiData.patientId,
      totalAmount: parseFloat(apiData.totalAmount),
      status: apiData.status,
      note: apiData.note,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
      // These would need to be populated from separate API calls or included in the response
      patient: {
        id: apiData.patientId,
        fullName: apiData.patient?.fullName || "Đang tải...",
        dateOfBirth: apiData.patient?.dateOfBirth || "1990-01-01",
        gender: apiData.patient?.gender || "MALE",
        phoneNumber: apiData.patient?.phoneNumber || "Đang tải...",
        email: apiData.patient?.email || "Đang tải...",
        address: apiData.patient?.address || "Đang tải...",
        cccd: apiData.patient?.cccd || "Đang tải..."
      },
      doctor: {
        id: apiData.doctorId,
        fullName: apiData.doctor?.fullName || "Đang tải...",
        specialty: apiData.doctor?.specialty || "Đang tải...",
        degree: apiData.doctor?.degree || "Đang tải...",
        position: apiData.doctor?.position || "Đang tải...",
        phoneNumber: apiData.doctor?.phoneNumber || "Đang tải...",
        email: apiData.doctor?.email || "Đang tải..."
      },
      visit: {
        id: apiData.visitId,
        checkInTime: apiData.visit?.checkInTime || apiData.createdAt,
        diagnosis: apiData.visit?.diagnosis || "Đang tải...",
        symptoms: apiData.visit?.symptoms || "Đang tải...",
        vitalSigns: {
          bloodPressure: apiData.visit?.vitalSigns?.bloodPressure || "Đang tải...",
          heartRate: apiData.visit?.vitalSigns?.heartRate || "Đang tải...",
          temperature: apiData.visit?.vitalSigns?.temperature || "Đang tải...",
          weight: apiData.visit?.vitalSigns?.weight || "Đang tải..."
        }
      },
      details: apiData.details?.map((detail: any) => ({
        id: detail.id,
        prescriptionId: detail.prescriptionId,
        medicineId: detail.medicineId,
        medicineName: detail.medicineName,
        quantity: detail.quantity,
        unit: detail.unit,
        unitPrice: parseFloat(detail.unitPrice),
        dosageMorning: parseFloat(detail.dosageMorning || 0),
        dosageNoon: parseFloat(detail.dosageNoon || 0),
        dosageAfternoon: parseFloat(detail.dosageAfternoon || 0),
        dosageEvening: parseFloat(detail.dosageEvening || 0),
        instruction: detail.instruction,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt
      })) || []
    }
  }
}