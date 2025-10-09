// API service for RespiraShield Insurance Dashboard
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios from 'axios';
import { User, DashboardData, MonthlyPayment, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Helper method for making HTTP requests
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
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

  // Set authentication token
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear authentication token
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Check if user exists by email
  async checkUserExists(email: string): Promise<ApiResponse<{ exists: boolean; user?: User }>> {
    return this.request('/auth/check-user', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Send login OTP
  async sendLoginOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/send-login-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Verify login OTP and get JWT token
  async verifyLoginOTP(email: string, otp: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.request<{ token: string; user: User }>('/auth/verify-login-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me');
  }

  // Refresh JWT token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await this.request<{ token: string }>('/auth/refresh');
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Logout user
  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    this.clearToken();
    return response;
  }

  // Get dashboard data
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return this.request('/dashboard');
  }

  // Get user's insurance plan details
  async getCurrentPlan(): Promise<ApiResponse> {
    return this.request('/dashboard/current-plan');
  }

  // Get user's applications
  async getUserApplications(): Promise<ApiResponse> {
    return this.request('/dashboard/applications');
  }

  // Get user's payment history
  async getPaymentHistory(): Promise<ApiResponse> {
    return this.request('/dashboard/payments');
  }

  // Get monthly payment aggregation for charts
  async getMonthlyPayments(year?: number): Promise<ApiResponse<MonthlyPayment[]>> {
    const yearParam = year ? `?year=${year}` : '';
    return this.request(`/dashboard/monthly-payments${yearParam}`);
  }

  // Get verification status
  async getVerificationStatus(): Promise<ApiResponse> {
    return this.request('/dashboard/verification-status');
  }

  // Get masked PII data
  async getMaskedPII(): Promise<ApiResponse> {
    return this.request('/dashboard/masked-pii');
  }

  // Download policy document
  async downloadPolicyDocument(applicationId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/dashboard/policy-document/${applicationId}`, {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download policy document');
    }

    return response.blob();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
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
