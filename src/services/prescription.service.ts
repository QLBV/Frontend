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
      days?: number
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
      days?: number
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

  // Lock prescription (make non-editable)
  static async lockPrescription(id: number): Promise<PrescriptionApiResponse> {
    try {
      const response = await api.post(`/prescriptions/${id}/lock`)
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
    // Get patient phone from profiles or direct field
    const patientPhone = apiData.patient?.user?.profiles?.find((p: any) => p.type === 'phone')?.value 
      || apiData.patient?.phone 
      || apiData.patient?.phoneNumber 
      || undefined

    // Get patient email from user or direct field  
    const patientEmail = apiData.patient?.user?.email 
      || apiData.patient?.email 
      || undefined

    // Get doctor phone from profiles or direct field
    const doctorPhone = apiData.doctor?.user?.profiles?.find((p: any) => p.type === 'phone')?.value
      || apiData.doctor?.phoneNumber
      || undefined

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
      patient: {
        id: apiData.patientId,
        fullName: apiData.visit?.appointment?.patientName || apiData.patient?.user?.fullName || apiData.patient?.fullName || "N/A",
        dateOfBirth: apiData.visit?.appointment?.patientDob || apiData.patient?.dateOfBirth || "",
        gender: apiData.visit?.appointment?.patientGender || apiData.patient?.gender || "MALE",
        phoneNumber: apiData.visit?.appointment?.patientPhone || patientPhone,
        email: patientEmail,
        address: apiData.patient?.address || undefined,
        cccd: apiData.patient?.cccd || undefined
      },
      doctor: {
        id: apiData.doctorId,
        // Don't include "BS." here - let UI handle the prefix
        fullName: apiData.doctor?.user?.fullName || apiData.doctor?.fullName || "N/A",
        specialty: apiData.doctor?.specialty?.name || (typeof apiData.doctor?.specialty === 'string' ? apiData.doctor?.specialty : ""),
        degree: apiData.doctor?.degree || undefined,
        position: apiData.doctor?.position || undefined,
        phoneNumber: doctorPhone,
        email: apiData.doctor?.user?.email || apiData.doctor?.email || undefined
      },
      visit: apiData.visit ? {
        id: apiData.visitId,
        checkInTime: apiData.visit?.checkInTime || apiData.createdAt,
        diagnosis: apiData.visit?.diagnosis || undefined,
        symptoms: apiData.visit?.symptoms || undefined,
        vitalSigns: apiData.visit?.vitalSigns ? {
          bloodPressure: apiData.visit.vitalSigns.bloodPressure || undefined,
          heartRate: apiData.visit.vitalSigns.heartRate || undefined,
          temperature: apiData.visit.vitalSigns.temperature || undefined,
          weight: apiData.visit.vitalSigns.weight || undefined
        } : undefined
      } : undefined,
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
        days: detail.days,
        instruction: detail.instruction,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt
      })) || []
    }
  }
}