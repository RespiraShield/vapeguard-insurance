// Type definitions for VapeGuard Insurance Dashboard

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  city: string;
  age: number;
  isActive: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsurancePlan {
  _id: string;
  planId: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  category: 'basic' | 'premium' | 'complete';
  isActive: boolean;
}

export interface Application {
  _id: string;
  applicationNumber: string;
  userId: string;
  insurancePlanId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'payment_pending' | 'completed';
  submittedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  userId: string;
  applicationId: string;
  insurancePlanId: string;
  amount: number;
  currency: string;
  paymentMethod: 'upi' | 'phonepe' | 'gpay' | 'paytm' | 'netbanking' | 'card';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transactionId?: string;
  initiatedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginOTP {
  email: string;
  otp: string;
  expiresAt: string;
  attempts: number;
  verified: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardData {
  user: User;
  currentPlan: InsurancePlan | null;
  applications: Application[];
  payments: Payment[];
  monthlyPayments: MonthlyPayment[];
}

export interface MonthlyPayment {
  month: string;
  year: number;
  amount: number;
  count: number;
}

export interface VerificationStatus {
  pan: 'verified' | 'pending' | 'failed' | 'unverified';
  aadhaar: 'verified' | 'pending' | 'failed' | 'unverified';
  phone: 'verified' | 'pending' | 'failed' | 'unverified';
  email: 'verified' | 'pending' | 'failed' | 'unverified';
  bank: 'verified' | 'pending' | 'failed' | 'unverified';
}

export interface MaskedPII {
  pan: string;
  aadhaar: string;
  phone: string;
  email: string;
  bankAccount: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
