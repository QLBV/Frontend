import api from "@/lib/api"

export interface PatientProfile {
  type: "phone" | "email" | "address"
  value: string
  city?: string
  ward?: string
}

export interface Patient {
  id: number
  userId: number
  patientCode: string
  fullName: string
  gender: string
  dateOfBirth: string
  phone?: string
  email?: string
  address?: string
  bloodType?: string
  height?: number
  weight?: number
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  avatar?: string
  isActive: boolean
  profiles?: PatientProfile[]
  chronicDiseases?: string[]
  allergies?: string[]
  createdAt: string
  updatedAt: string
}

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
  createdAt: string
  updatedAt: string
  patient?: Patient
  doctor?: {
    id: number
    fullName: string
  }
}

export interface Prescription {
  id: number
  visitId: number
  patientId: number
  doctorId: number
  prescriptionCode: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  patient?: Patient
  doctor?: {
    id: number
    fullName: string
  }
  medicines?: Array<{
    id: number
    medicineId: number
    quantity: number
    dosage: string
    frequency: string
    duration: string
    medicine?: {
      id: number
      name: string
    }
  }>
}

/**
 * Setup patient profile (for new patients)
 */
export const setupPatientProfile = async (data: {
  fullName: string
  gender: "MALE" | "FEMALE" | "OTHER"
  dateOfBirth: string
  cccd: string
  profiles: Array<{
    type: "phone" | "email" | "address"
    value: string
    city?: string
    ward?: string
  }>
}): Promise<Patient> => {
  const response = await api.post("/patients/setup", data)
  // Backend returns { success: true, data: {...} }
  if (response.data.data) {
    return response.data.data
  }
  return response.data
}

/**
 * Get patient by ID
 */
export const getPatientById = async (patientId: number): Promise<Patient> => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'patient.service.ts:84',message:'API_CALL_START',data:{patientId,url:`/patients/${patientId}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
  // #endregion
  const response = await api.get(`/patients/${patientId}`)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'patient.service.ts:87',message:'API_RESPONSE_RECEIVED',data:{hasResponse:!!response,hasData:!!response?.data,hasPatient:!!response?.data?.patient,hasDataField:!!response?.data?.data,responseKeys:Object.keys(response?.data || {})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
  // #endregion
  // Backend returns { success: true, patient: {...} }
  if (response.data.patient) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'patient.service.ts:90',message:'RETURNING_PATIENT_FROM_RESPONSE',data:{patientId:response.data.patient?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    return response.data.patient
  }
  // Fallback for other response formats
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'patient.service.ts:94',message:'USING_FALLBACK_RESPONSE',data:{hasDataField:!!response.data.data,hasData:!!response.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
  // #endregion
  return response.data.data || response.data
}

/**
 * Update patient
 */
export const updatePatient = async (
  patientId: number,
  data: Partial<Patient>
): Promise<Patient> => {
  const response = await api.put(`/patients/${patientId}`, data)
  // Backend returns { success: true, patient: {...} }
  if (response.data.patient) {
    return response.data.patient
  }
  // Fallback for other response formats
  return response.data.data || response.data
}

/**
 * Upload patient avatar
 */
export const uploadPatientAvatar = async (
  patientId: number,
  file: File
): Promise<{ avatar: string }> => {
  const formData = new FormData()
  formData.append("avatar", file)

  const response = await api.post(`/patients/${patientId}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data.data || response.data
}

/**
 * Get patient medical history (visits)
 */
export const getPatientMedicalHistory = async (
  patientId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Visit[]; pagination: any }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  const response = await api.get(
    `/patients/${patientId}/medical-history?${params.toString()}`
  )
  
  // Backend returns: { success: true, data: { visits: [...], prescriptions: [...] } }
  // Extract visits array from the nested structure
  const responseData = response.data.data || {}
  const visits = Array.isArray(responseData.visits) ? responseData.visits : []
  
  return {
    data: visits,
    pagination: response.data.pagination || {},
  }
}

/**
 * Get patient prescriptions
 */
export const getPatientPrescriptions = async (
  patientId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Prescription[]; pagination: any }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  const response = await api.get(
    `/patients/${patientId}/prescriptions?${params.toString()}`
  )
  return {
    data: response.data.data || [],
    pagination: response.data.pagination || {},
  }
}

/**
 * Get all patients with pagination
 */
export const getPatients = async (params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<{ patients: Patient[]; pagination: any }> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.limit) queryParams.append("limit", params.limit.toString())
  if (params?.search) queryParams.append("search", params.search)

  const response = await api.get(`/patients?${queryParams.toString()}`)
  
  // Backend returns { success: true, patients: [...], pagination: {...} }
  if (response.data.patients) {
    return {
      patients: response.data.patients,
      pagination: response.data.pagination || {},
    }
  }
  
  // Fallback format
  return {
    patients: response.data.data || [],
    pagination: response.data.pagination || {},
  }
}
