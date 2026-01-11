import api from "@/lib/api"

export interface GenerationPreview {
  success: boolean
  period: {
    year: number
    month: number
    startDate: string
    endDate: string
  }
  totalTemplates: number
  totalShifts: number
  newShifts: number
  existingShifts: number
  shifts: Array<{
    date: string
    doctorId: number
    shiftId: number
    exists: boolean
  }>
}

export interface GenerationResult {
  success: boolean
  message: string
  generated: number
  skipped: number
  period: {
    year: number
    month: number
    startDate: string
    endDate: string
  }
}

export const ScheduleGenerationService = {
  /**
   * Preview schedule generation for the next month
   */
  previewNextMonth: async (): Promise<GenerationPreview> => {
    const response = await api.get("/schedule-generation/preview")
    return response.data
  },

  /**
   * Generate schedule for the next month
   */
  generateNextMonth: async (): Promise<GenerationResult> => {
    const response = await api.post("/schedule-generation/generate-monthly")
    return response.data
  },

  /**
   * Generate schedule for a specific month
   * @param year Year (e.g. 2024)
   * @param month Month (1-12)
   */
  generateForMonth: async (year: number, month: number): Promise<GenerationResult> => {
    const response = await api.post("/schedule-generation/generate-for-month", {
      year,
      month
    })
    return response.data
  }
}
