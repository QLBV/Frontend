import api from "@/lib/api"

export interface Visit {
  id: number
  appointmentId: number
  patientId: number
  doctorId: number
  visitDate: string
  symptoms?: string
  diagnosis?: string
  notes?: string
  status: string
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    respiratoryRate?: number
    weight?: number
    height?: number
  }
  createdAt: string
  updatedAt: string
  patient?: {
    id: number
    fullName: string
    patientCode: string
  }
  doctor?: {
    id: number
    fullName: string
  }
  appointment?: {
    id: number
    date: string
    shift?: {
      name: string
      startTime: string
      endTime: string
    }
  }
}

/**
 * Check-in appointment (create visit)
 */
export const checkInAppointment = async (
  appointmentId: number
): Promise<Visit> => {
  const response = await api.post(`/visits/checkin/${appointmentId}`)
  return response.data.data || response.data
}

/**
 * Get visits with filters
 */
export const getVisits = async (params?: {
  date?: string
  doctorId?: number
  patientId?: number
  status?: string
  page?: number
  limit?: number
}): Promise<{ data: Visit[]; pagination?: any }> => {
  const queryParams = new URLSearchParams()
  if (params?.date) queryParams.append("date", params.date)
  if (params?.doctorId) queryParams.append("doctorId", params.doctorId.toString())
  if (params?.patientId) queryParams.append("patientId", params.patientId.toString())
  if (params?.status) queryParams.append("status", params.status)
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.limit) queryParams.append("limit", params.limit.toString())

  const response = await api.get(`/visits?${queryParams.toString()}`)
  return {
    data: response.data.data || [],
    pagination: response.data.pagination,
  }
}

/**
 * Get visits by patient ID
 */
export const getPatientVisits = async (
  patientId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Visit[]; pagination?: any }> => {
  const params = new URLSearchParams({
    patientId: patientId.toString(),
    page: page.toString(),
    limit: limit.toString(),
  })

  const response = await api.get(`/visits/patient/${patientId}?${params.toString()}`)
  return {
    data: response.data.data || [],
    pagination: response.data.pagination,
  }
}

/**
 * Get visit by ID
 */
export const getVisitById = async (visitId: number): Promise<Visit> => {
  const response = await api.get(`/visits/${visitId}`)
  return response.data.data || response.data
}

/**
 * Complete visit
 */
export const completeVisit = async (visitId: number): Promise<Visit> => {
  const response = await api.put(`/visits/${visitId}/complete`)
  return response.data.data || response.data
}
