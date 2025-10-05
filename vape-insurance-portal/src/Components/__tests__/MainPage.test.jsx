import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VapeInsurancePortal from '../MainPage';

// Mock the API service
jest.mock('../../services/api', () => ({
  healthCheck: jest.fn().mockResolvedValue(true),
  submitPersonalDetails: jest.fn().mockResolvedValue({
    data: { applicationId: 'test123', applicationNumber: 'VG123456' }
  }),
  uploadBillPhoto: jest.fn().mockResolvedValue({ success: true }),
  selectInsurance: jest.fn().mockResolvedValue({ success: true }),
  submitPaymentDetails: jest.fn().mockResolvedValue({ success: true }),
  processPayment: jest.fn().mockResolvedValue({ success: true }),
  submitApplication: jest.fn().mockResolvedValue({ success: true })
}));

describe('MainPage UI Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Initial Render Tests', () => {
    test('should render the main header with title and subtitle', () => {
      render(<VapeInsurancePortal />);
      
      // Check if main title is visible
      expect(screen.getByText('VapeGuard Insurance')).toBeInTheDocument();
      
      // Check if subtitle is visible
      expect(screen.getByText(/Protect your health with specialized coverage/)).toBeInTheDocument();
    });

    test('should render step indicator with 3 steps', () => {
      render(<VapeInsurancePortal />);
      
      // Check if step indicators are visible
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      // Check if first step is active
      const step1 = screen.getByText('1').closest('.step');
      expect(step1).toHaveClass('active');
    });

    test('should render PersonalDetailsStep as the first step', () => {
      render(<VapeInsurancePortal />);
      
      // Check if personal details form elements are visible
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Date of Birth *')).toBeInTheDocument();
      expect(screen.getByLabelText('City *')).toBeInTheDocument();
      expect(screen.getByText(/Bill photo is required/)).toBeInTheDocument();
    });

    test('should render navigation buttons correctly', () => {
      render(<VapeInsurancePortal />);
      
      // Check if Next Step button is visible and enabled
      const nextButton = screen.getByText('Next Step');
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toBeDisabled(); // Should be disabled initially
      
      // Check if Previous button is not visible on first step
      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation Tests', () => {
    test('should show validation errors for empty required fields', async () => {
      render(<VapeInsurancePortal />);
      
      // Try to proceed without filling required fields
      const nextButton = screen.getByText('Next Step');
      fireEvent.click(nextButton);
      
      // Check if validation errors are displayed
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
        expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
        expect(screen.getByText('Please select your city from the dropdown')).toBeInTheDocument();
        expect(screen.getByText('Bill photo is required to verify your vape purchase')).toBeInTheDocument();
      });
    });

    test('should show validation error for underage person', async () => {
      render(<VapeInsurancePortal />);
      
      // Fill in name and city
      fireEvent.change(screen.getByLabelText('Full Name *'), {
        target: { value: 'John Doe' }
      });
      
      fireEvent.change(screen.getByLabelText('City *'), {
        target: { value: 'mumbai' }
      });
      
      // Set date of birth to make person under 18
      const today = new Date();
      const underageDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      const underageDateString = underageDate.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText('Date of Birth *'), {
        target: { value: underageDateString }
      });
      
      // Try to proceed
      const nextButton = screen.getByText('Next Step');
      fireEvent.click(nextButton);
      
      // Check if age validation error is shown
      await waitFor(() => {
        expect(screen.getByText(/You must be 18 years or older/)).toBeInTheDocument();
      });
    });

    test('should show validation error for invalid name format', async () => {
      render(<VapeInsurancePortal />);
      
      // Enter invalid name with numbers
      fireEvent.change(screen.getByLabelText('Full Name *'), {
        target: { value: 'John123' }
      });
      
      // Trigger blur event
      fireEvent.blur(screen.getByLabelText('Full Name *'));
      
      // Check if validation error is shown
      await waitFor(() => {
        expect(screen.getByText('Name can only contain letters and spaces')).toBeInTheDocument();
      });
    });
  });

  describe('Step Navigation Tests', () => {
    test('should move to step 2 when all required fields are filled', async () => {
      render(<VapeInsurancePortal />);
      
      // Fill in all required fields
      fireEvent.change(screen.getByLabelText('Full Name *'), {
        target: { value: 'John Doe' }
      });
      
      const today = new Date();
      const validDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      const validDateString = validDate.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText('Date of Birth *'), {
        target: { value: validDateString }
      });
      
      fireEvent.change(screen.getByLabelText('City *'), {
        target: { value: 'mumbai' }
      });
      
      // Mock file upload
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/Bill photo is required/);
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      // Click Next Step
      const nextButton = screen.getByText('Next Step');
      fireEvent.click(nextButton);
      
      // Wait for step change and check if insurance selection is visible
      await waitFor(() => {
        expect(screen.getByText('Choose Your Insurance Plan')).toBeInTheDocument();
        expect(screen.getByText('Basic Respiratory Care')).toBeInTheDocument();
        expect(screen.getByText('Premium Lung Shield')).toBeInTheDocument();
        expect(screen.getByText('Complete Wellness Pro')).toBeInTheDocument();
      });
      
      // Check if step 2 is now active
      const step2 = screen.getByText('2').closest('.step');
      expect(step2).toHaveClass('active');
    });

    test('should show Previous button on step 2', async () => {
      render(<VapeInsurancePortal />);
      
      // Fill in all required fields and move to step 2
      fireEvent.change(screen.getByLabelText('Full Name *'), {
        target: { value: 'John Doe' }
      });
      
      const today = new Date();
      const validDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      const validDateString = validDate.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText('Date of Birth *'), {
        target: { value: validDateString }
      });
      
      fireEvent.change(screen.getByLabelText('City *'), {
        target: { value: 'mumbai' }
      });
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/Bill photo is required/);
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      fireEvent.click(screen.getByText('Next Step'));
      
      // Wait for step 2 and check Previous button
      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Next Step')).toBeInTheDocument();
      });
    });
  });

  describe('Insurance Selection Tests', () => {
    beforeEach(async () => {
      // Setup: Fill step 1 and move to step 2
      render(<VapeInsurancePortal />);
      
      fireEvent.change(screen.getByLabelText('Full Name *'), {
        target: { value: 'John Doe' }
      });
      
      const today = new Date();
      const validDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      const validDateString = validDate.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText('Date of Birth *'), {
        target: { value: validDateString }
      });
      
      fireEvent.change(screen.getByLabelText('City *'), {
        target: { value: 'mumbai' }
      });
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/Bill photo is required/);
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      fireEvent.click(screen.getByText('Next Step'));
      
      await waitFor(() => {
        expect(screen.getByText('Choose Your Insurance Plan')).toBeInTheDocument();
      });
    });

    test('should display all three insurance plans with correct details', () => {
      // Check if all plans are visible
      expect(screen.getByText('Basic Respiratory Care')).toBeInTheDocument();
      expect(screen.getByText('₹149/purchase')).toBeInTheDocument();
      expect(screen.getByText('Lung function monitoring')).toBeInTheDocument();
      
      expect(screen.getByText('Premium Lung Shield')).toBeInTheDocument();
      expect(screen.getByText('₹299/purchase')).toBeInTheDocument();
      expect(screen.getByText('Advanced lung imaging')).toBeInTheDocument();
      
      expect(screen.getByText('Complete Wellness Pro')).toBeInTheDocument();
      expect(screen.getByText('₹499/purchase')).toBeInTheDocument();
      expect(screen.getByText('Full body health screening')).toBeInTheDocument();
    });

    test('should highlight selected insurance plan', async () => {
      // Click on Premium plan
      const premiumPlan = screen.getByText('Premium Lung Shield').closest('.insurance-card');
      fireEvent.click(premiumPlan);
      
      // Check if it's highlighted
      expect(premiumPlan).toHaveClass('selected');
      
      // Check if Next Step button is enabled
      const nextButton = screen.getByText('Next Step');
      expect(nextButton).not.toBeDisabled();
    });

    test('should show validation error if no plan is selected', async () => {
      // Try to proceed without selecting a plan
      const nextButton = screen.getByText('Next Step');
      fireEvent.click(nextButton);
      
      // Check if validation error is shown
      await waitFor(() => {
        expect(screen.getByText('Please select an insurance plan to continue')).toBeInTheDocument();
      });
    });
  });

  describe('Payment Step Tests', () => {
    beforeEach(async () => {
      // Setup: Complete steps 1 and 2, move to step 3
      render(<VapeInsurancePortal />);
      
      // Step 1: Fill personal details
      fireEvent.change(screen.getByLabelText('Full Name *'), {
        target: { value: 'John Doe' }
      });
      
      const today = new Date();
      const validDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      const validDateString = validDate.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText('Date of Birth *'), {
        target: { value: validDateString }
      });
      
      fireEvent.change(screen.getByLabelText('City *'), {
        target: { value: 'mumbai' }
      });
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/Bill photo is required/);
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      fireEvent.click(screen.getByText('Next Step'));
      
      // Step 2: Select insurance plan
      await waitFor(() => {
        expect(screen.getByText('Choose Your Insurance Plan')).toBeInTheDocument();
      });
      
      const premiumPlan = screen.getByText('Premium Lung Shield').closest('.insurance-card');
      fireEvent.click(premiumPlan);
      
      fireEvent.click(screen.getByText('Next Step'));
      
      // Wait for payment step
      await waitFor(() => {
        expect(screen.getByText('Secure Payment')).toBeInTheDocument();
      });
    });

    test('should display all payment methods', () => {
      expect(screen.getByText('Paytm')).toBeInTheDocument();
      expect(screen.getByText('PhonePe')).toBeInTheDocument();
      expect(screen.getByText('Google Pay')).toBeInTheDocument();
      expect(screen.getByText('UPI')).toBeInTheDocument();
      expect(screen.getByText('Razorpay')).toBeInTheDocument();
      expect(screen.getByText('Net Banking')).toBeInTheDocument();
    });

    test('should show UPI form when UPI is selected', async () => {
      // Click on UPI payment method
      const upiMethod = screen.getByText('UPI').closest('.payment-method');
      fireEvent.click(upiMethod);
      
      // Check if UPI form is visible
      await waitFor(() => {
        expect(screen.getByLabelText('UPI ID *')).toBeInTheDocument();
      });
    });

    test('should show net banking form when net banking is selected', async () => {
      // Click on Net Banking payment method
      const netBankingMethod = screen.getByText('Net Banking').closest('.payment-method');
      fireEvent.click(netBankingMethod);
      
      // Check if net banking form is visible
      await waitFor(() => {
        expect(screen.getByLabelText('Select Bank *')).toBeInTheDocument();
        expect(screen.getByLabelText('Account Number *')).toBeInTheDocument();
      });
    });

    test('should show card form when card payment method is selected', async () => {
      // Click on Razorpay payment method
      const razorpayMethod = screen.getByText('Razorpay').closest('.payment-method');
      fireEvent.click(razorpayMethod);
      
      // Check if card form is visible
      await waitFor(() => {
        expect(screen.getByLabelText('Card Number *')).toBeInTheDocument();
        expect(screen.getByLabelText('Expiry Date *')).toBeInTheDocument();
        expect(screen.getByLabelText('CVV *')).toBeInTheDocument();
        expect(screen.getByLabelText('Cardholder Name *')).toBeInTheDocument();
      });
    });
  });

  describe('Success Step Tests', () => {
    test('should show success message after completing all steps', async () => {
      render(<VapeInsurancePortal />);
      
      // Complete all steps (this is a complex flow, so we'll test the success step directly)
      // For now, let's test if the success step renders correctly when given the right props
      
      // We'll need to mock the complete flow or test the success step component separately
      // This test will be expanded once we have the complete flow working
    });
  });

  describe('Error Handling Tests', () => {
    test('should show validation summary when there are errors', async () => {
      render(<VapeInsurancePortal />);
      
      // Try to proceed without filling required fields
      const nextButton = screen.getByText('Next Step');
      fireEvent.click(nextButton);
      
      // Check if validation summary is displayed
      await waitFor(() => {
        expect(screen.getByText('Please fix the following issues:')).toBeInTheDocument();
      });
    });

    test('should clear validation errors when fields are filled correctly', async () => {
      render(<VapeInsurancePortal />);
      
      // Fill in name correctly
      fireEvent.change(screen.getByLabelText('Full Name *'), {
        target: { value: 'John Doe' }
      });
      
      // Trigger blur to validate
      fireEvent.blur(screen.getByLabelText('Full Name *'));
      
      // Check if name error is cleared
      await waitFor(() => {
        expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design Tests', () => {
    test('should render all elements on different screen sizes', () => {
      // Test with different viewport sizes
      const { rerender } = render(<VapeInsurancePortal />);
      
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      window.dispatchEvent(new Event('resize'));
      
      // Check if all essential elements are still visible
      expect(screen.getByText('VapeGuard Insurance')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
      
      // Test tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      window.dispatchEvent(new Event('resize'));
      rerender(<VapeInsurancePortal />);
      
      // Check if all elements are still visible
      expect(screen.getByText('VapeGuard Insurance')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
    });
  });
});
