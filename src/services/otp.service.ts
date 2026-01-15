import api from '@/lib/api'

export interface SendOTPResponse {
  success: boolean
  message: string
  data?: {
    email: string
    expiresIn: number
  }
}

export interface VerifyOTPResponse {
  success: boolean
  message: string
  data?: {
    email: string
    isEmailVerified: boolean
  }
}

/**
 * OTP Service for Email Verification
 */
export class OTPService {
  /**
   * Send OTP to email
   */
  static async sendOTP(email: string): Promise<SendOTPResponse> {
    const response = await api.post('/auth/send-otp', { email })
    return response.data
  }

  /**
   * Verify OTP code
   */
  static async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    const response = await api.post('/auth/verify-otp', { email, otp })
    return response.data
  }

  /**
   * Resend OTP
   */
  static async resendOTP(email: string): Promise<SendOTPResponse> {
    const response = await api.post('/auth/resend-otp', { email })
    return response.data
  }
}
