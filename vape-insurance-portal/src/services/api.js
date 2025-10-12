// API service for VapeGuard Insurance Backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Check if email already exists
  async checkEmailExists(email) {
    const response = await fetch(`${API_BASE_URL}/application/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check email');
    }

    return response.json();
  }

  // Send Email OTP (before user registration)
  async sendEmailOTP(email, name) {
    const response = await fetch(`${API_BASE_URL}/otp/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send OTP');
    }

    return response.json();
  }

  // Verify Email OTP (before user registration)
  async verifyEmailOTP(email, otp) {
    const response = await fetch(`${API_BASE_URL}/otp/email/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to verify OTP');
    }

    return response.json();
  }

  // Check if email is verified
  async checkEmailVerified(email) {
    const response = await fetch(`${API_BASE_URL}/otp/email/check-verified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check verification status');
    }

    return response.json();
  }

  // Personal Details API
  async submitPersonalDetails(personalData) {
    const response = await fetch(`${API_BASE_URL}/application/personal-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: personalData.name,
        email: personalData.email,
        phone: personalData.phone,
        dateOfBirth: personalData.dateOfBirth,
        city: personalData.city,
        vapingFrequencyValue: personalData.vapingFrequencyValue,
        vapingFrequencyCadence: personalData.vapingFrequencyCadence
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit personal details');
    }

    return response.json();
  }

  // Update Personal Details API (email cannot be changed)
  async updatePersonalDetails(applicationId, personalData) {
    const response = await fetch(`${API_BASE_URL}/application/${applicationId}/personal-details`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: personalData.name,
        // email is intentionally excluded - cannot be changed after creation
        phone: personalData.phone,
        dateOfBirth: personalData.dateOfBirth,
        city: personalData.city,
        vapingFrequencyValue: personalData.vapingFrequencyValue,
        vapingFrequencyCadence: personalData.vapingFrequencyCadence
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update personal details');
    }

    return response.json();
  }

  // File Upload API
  async uploadBillPhoto(applicationId, file) {
    const formData = new FormData();
    formData.append('billPhoto', file);

    return this.request(`/application/${applicationId}/upload-bill`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  // Insurance Selection API
  async selectInsurance(applicationId, selectedInsurance) {
    return this.request(`/application/${applicationId}/insurance`, {
      method: 'PUT',
      body: JSON.stringify({ selectedInsurance }),
    });
  }

  // Get Insurance Plans
  async getInsurancePlans() {
    return this.request('/insurance/plans');
  }

  // Payment Details API
  async submitPaymentDetails(applicationId, paymentData) {
    return this.request(`/application/${applicationId}/payment`, {
      method: 'PUT',
      body: JSON.stringify({
        paymentMethod: paymentData.paymentMethod,
        ...(paymentData.upiId && { upiId: paymentData.upiId }),
        ...(paymentData.selectedBank && { selectedBank: paymentData.selectedBank }),
        ...(paymentData.accountNumber && { accountNumber: paymentData.accountNumber }),
        ...(paymentData.cardNumber && { cardNumber: paymentData.cardNumber }),
        ...(paymentData.expiryDate && { expiryDate: paymentData.expiryDate }),
        ...(paymentData.cvv && { cvv: paymentData.cvv }),
        ...(paymentData.cardholderName && { cardholderName: paymentData.cardholderName }),
      }),
    });
  }

  // Payment Processing APIs
  async createPaymentOrder(applicationId) {
    return this.request(`/payment/create-order/${applicationId}`, {
      method: 'POST',
    });
  }

  async verifyPayment(paymentData) {
    return this.request(`/payment/verify`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async processPayment(transactionData) {
    return this.request(`/payment/process`, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Submit Complete Application
  async submitApplication(applicationId) {
    return this.request(`/application/${applicationId}/submit`, {
      method: 'POST',
    });
  }

  // Enroll Application (Pay Later)
  async enrollApplication(applicationId) {
    return this.request(`/application/${applicationId}/enroll`, {
      method: 'POST',
    });
  }

  // Get Application Details
  async getApplication(applicationId) {
    return this.request(`/application/${applicationId}`);
  }

  async getApplicationByNumber(applicationNumber) {
    return this.request(`/application/number/${applicationNumber}`);
  }

  // Get Payment Status
  async getPaymentStatus(applicationId) {
    return this.request(`/payment/status/${applicationId}`);
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for easier importing
export const {
  submitPersonalDetails,
  updatePersonalDetails,
  uploadBillPhoto,
  selectInsurance,
  getInsurancePlans,
  submitPaymentDetails,
  createPaymentOrder,
  verifyPayment,
  processPayment,
  submitApplication,
  enrollApplication,
  getApplication,
  getApplicationByNumber,
  getPaymentStatus,
  healthCheck,
} = apiService;
