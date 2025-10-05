import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('Visual Rendering Debug Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear console to see only our debug logs
    console.clear();
  });

  describe('Component Structure Verification', () => {
    test('should render the complete component structure', () => {
      console.log('🔍 Starting component structure test...');
      
      const { container } = render(<VapeInsurancePortal />);
      
      console.log('🔍 Component rendered, checking structure...');
      
      // Check if the main container exists
      const mainContainer = container.querySelector('.container');
      expect(mainContainer).toBeInTheDocument();
      console.log('✅ Main container found');
      
      // Check if form container exists
      const formContainer = container.querySelector('.form-container');
      expect(formContainer).toBeInTheDocument();
      console.log('✅ Form container found');
      
      // Check if header exists
      const header = container.querySelector('.header');
      expect(header).toBeInTheDocument();
      console.log('✅ Header found');
      
      // Check if form content exists
      const formContent = container.querySelector('.form-content');
      expect(formContent).toBeInTheDocument();
      console.log('✅ Form content found');
      
      console.log('🔍 Component structure verification complete');
    });

    test('should render header content correctly', () => {
      console.log('🔍 Testing header content rendering...');
      
      render(<VapeInsurancePortal />);
      
      // Check title
      const title = screen.getByText('VapeGuard Insurance');
      expect(title).toBeInTheDocument();
      console.log('✅ Title found:', title.textContent);
      
      // Check subtitle
      const subtitle = screen.getByText(/Protect your health with specialized coverage/);
      expect(subtitle).toBeInTheDocument();
      console.log('✅ Subtitle found:', subtitle.textContent);
      
      console.log('🔍 Header content test complete');
    });

    test('should render step indicators', () => {
      console.log('🔍 Testing step indicators rendering...');
      
      render(<VapeInsurancePortal />);
      
      // Check if step indicators are rendered
      const stepIndicators = screen.getByText('1').closest('.step-indicator');
      expect(stepIndicators).toBeInTheDocument();
      console.log('✅ Step indicators container found');
      
      // Check individual steps
      const step1 = screen.getByText('1');
      const step2 = screen.getByText('2');
      const step3 = screen.getByText('3');
      
      expect(step1).toBeInTheDocument();
      expect(step2).toBeInTheDocument();
      expect(step3).toBeInTheDocument();
      
      console.log('✅ All step numbers found:', {
        step1: step1.textContent,
        step2: step2.textContent,
        step3: step3.textContent
      });
      
      console.log('🔍 Step indicators test complete');
    });

    test('should render first step content (PersonalDetailsStep)', () => {
      console.log('🔍 Testing first step content rendering...');
      
      render(<VapeInsurancePortal />);
      
      // Check if form fields are rendered
      const nameField = screen.getByLabelText('Full Name *');
      const dobField = screen.getByLabelText('Date of Birth *');
      const cityField = screen.getByLabelText('City *');
      
      expect(nameField).toBeInTheDocument();
      expect(dobField).toBeInTheDocument();
      expect(cityField).toBeInTheDocument();
      
      console.log('✅ Form fields found:', {
        name: nameField.tagName,
        dob: dobField.tagName,
        city: cityField.tagName
      });
      
      // Check if file upload area is rendered with correct text
      const fileUploadText = screen.getByText('Upload Bill Photo *');
      expect(fileUploadText).toBeInTheDocument();
      console.log('✅ File upload area found');
      
      // Check if file upload instructions are visible
      const uploadInstructions = screen.getByText(/Click to upload/);
      expect(uploadInstructions).toBeInTheDocument();
      console.log('✅ File upload instructions found');
      
      console.log('🔍 First step content test complete');
    });

    test('should render navigation buttons', () => {
      console.log('🔍 Testing navigation buttons rendering...');
      
      render(<VapeInsurancePortal />);
      
      // Check if Next Step button exists
      const nextButton = screen.getByText('Next Step');
      expect(nextButton).toBeInTheDocument();
      console.log('✅ Next Step button found');
      
      // Check if Previous button is not visible on first step
      const prevButton = screen.queryByText('Previous');
      expect(prevButton).not.toBeInTheDocument();
      console.log('✅ Previous button correctly hidden on first step');
      
      console.log('🔍 Navigation buttons test complete');
    });
  });

  describe('CSS Class Verification', () => {
    test('should have correct CSS classes applied', () => {
      console.log('🔍 Testing CSS classes...');
      
      const { container } = render(<VapeInsurancePortal />);
      
      // Check main container classes
      const mainContainer = container.querySelector('.container');
      expect(mainContainer).toHaveClass('container');
      console.log('✅ Main container has correct class');
      
      // Check form container classes
      const formContainer = container.querySelector('.form-container');
      expect(formContainer).toHaveClass('form-container');
      console.log('✅ Form container has correct class');
      
      // Check header classes
      const header = container.querySelector('.header');
      expect(header).toHaveClass('header');
      console.log('✅ Header has correct class');
      
      // Check form content classes
      const formContent = container.querySelector('.form-content');
      expect(formContent).toHaveClass('form-content');
      console.log('✅ Form content has correct class');
      
      console.log('🔍 CSS classes test complete');
    });

    test('should have step indicator classes', () => {
      console.log('🔍 Testing step indicator classes...');
      
      const { container } = render(<VapeInsurancePortal />);
      
      const stepIndicators = container.querySelector('.step-indicator');
      expect(stepIndicators).toHaveClass('step-indicator');
      console.log('✅ Step indicators container has correct class');
      
      // Check individual step classes
      const step1 = container.querySelector('.step');
      expect(step1).toHaveClass('step', 'active');
      console.log('✅ First step has correct classes');
      
      console.log('🔍 Step indicator classes test complete');
    });
  });

  describe('DOM Structure Verification', () => {
    test('should have proper HTML structure', () => {
      console.log('🔍 Testing HTML structure...');
      
      const { container } = render(<VapeInsurancePortal />);
      
      // Check if we have the expected HTML structure
      const html = container.innerHTML;
      
      // Look for key elements in the HTML
      expect(html).toContain('VapeGuard Insurance');
      expect(html).toContain('Protect your health');
      expect(html).toContain('Full Name');
      expect(html).toContain('Date of Birth');
      expect(html).toContain('City');
      expect(html).toContain('Upload Bill Photo');
      
      console.log('✅ All expected text content found in HTML');
      
      // Check for form elements
      expect(html).toContain('<input');
      expect(html).toContain('<select');
      expect(html).toContain('<button');
      
      console.log('✅ All expected HTML elements found');
      
      console.log('🔍 HTML structure test complete');
    });

    test('should render form elements with correct attributes', () => {
      console.log('🔍 Testing form element attributes...');
      
      render(<VapeInsurancePortal />);
      
      const nameInput = screen.getByLabelText('Full Name *');
      const dobInput = screen.getByLabelText('Date of Birth *');
      const citySelect = screen.getByLabelText('City *');
      
      // Check input types
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(dobInput).toHaveAttribute('type', 'date');
      expect(citySelect.tagName).toBe('SELECT');
      
      console.log('✅ Form elements have correct types and attributes');
      
      // Check required attributes
      expect(nameInput).toHaveAttribute('required');
      expect(dobInput).toHaveAttribute('required');
      expect(citySelect).toHaveAttribute('required');
      
      console.log('✅ Form elements have required attributes');
      
      console.log('🔍 Form element attributes test complete');
    });
  });

  describe('Component State Verification', () => {
    test('should start with correct initial state', () => {
      console.log('🔍 Testing initial component state...');
      
      render(<VapeInsurancePortal />);
      
      // Check if first step is active
      const step1 = screen.getByText('1').closest('.step');
      expect(step1).toHaveClass('active');
      console.log('✅ First step is active');
      
      // Check if Next Step button is disabled initially
      const nextButton = screen.getByText('Next Step');
      expect(nextButton).toBeDisabled();
      console.log('✅ Next Step button is disabled initially');
      
      // Check if form fields are empty
      const nameInput = screen.getByLabelText('Full Name *');
      const dobInput = screen.getByLabelText('Date of Birth *');
      const citySelect = screen.getByLabelText('City *');
      
      expect(nameInput.value).toBe('');
      expect(dobInput.value).toBe('');
      expect(citySelect.value).toBe('');
      
      console.log('✅ Form fields start empty');
      
      console.log('🔍 Initial state test complete');
    });
  });

  describe('Error Handling Verification', () => {
    test('should handle missing props gracefully', () => {
      console.log('🔍 Testing error handling...');
      
      // This test ensures the component doesn't crash with missing props
      expect(() => {
        render(<VapeInsurancePortal />);
      }).not.toThrow();
      
      console.log('✅ Component renders without crashing');
      
      console.log('🔍 Error handling test complete');
    });
  });

  describe('Performance Verification', () => {
    test('should render within reasonable time', () => {
      console.log('🔍 Testing render performance...');
      
      const startTime = performance.now();
      
      render(<VapeInsurancePortal />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`⏱️  Component rendered in ${renderTime.toFixed(2)}ms`);
      
      // Component should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
      
      console.log('✅ Component renders within performance threshold');
      
      console.log('🔍 Performance test complete');
    });
  });
});
