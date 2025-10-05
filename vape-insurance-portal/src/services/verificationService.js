const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class VerificationService {
  // Send Email OTP
  async sendEmailOTP(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/verification/email/send/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email OTP');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Verify Email OTP
  async verifyEmailOTP(applicationId, otp) {
    try {
      const response = await fetch(`${API_BASE_URL}/verification/email/verify/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email OTP');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Send Phone OTP
  async sendPhoneOTP(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/verification/phone/send/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send phone OTP');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Verify Phone OTP
  async verifyPhoneOTP(applicationId, otp) {
    try {
      const response = await fetch(`${API_BASE_URL}/verification/phone/verify/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify phone OTP');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get Verification Status
  async getVerificationStatus(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/verification/status/${applicationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get verification status');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

const verificationService = new VerificationService();
export default verificationService;
