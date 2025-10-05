import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PersonalDetailsStep from '../PersonalDetailsStep';

describe('PersonalDetailsStep UI Tests', () => {
  const mockProps = {
    formData: {
      name: '',
      dob: '',
      city: '',
      billPhoto: null
    },
    errors: {},
    handleInputChange: jest.fn(),
    handleBlur: jest.fn(),
    handleFileUpload: jest.fn(),
    handleDragOver: jest.fn(),
    handleDragLeave: jest.fn(),
    handleDrop: jest.fn(),
    removeFile: jest.fn(),
    renderValidationSummary: jest.fn().mockReturnValue(null)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render Tests', () => {
    test('should render all form fields with correct labels', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      // Check if all form fields are visible
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Date of Birth *')).toBeInTheDocument();
      expect(screen.getByLabelText('City *')).toBeInTheDocument();
      expect(screen.getByText(/Bill photo is required/)).toBeInTheDocument();
    });

    test('should render city dropdown with all options', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const citySelect = screen.getByLabelText('City *');
      expect(citySelect).toBeInTheDocument();
      
      // Check if major cities are present
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      expect(screen.getByText('Bangalore')).toBeInTheDocument();
      expect(screen.getByText('Hyderabad')).toBeInTheDocument();
      expect(screen.getByText('Chennai')).toBeInTheDocument();
      expect(screen.getByText('Kolkata')).toBeInTheDocument();
    });

    test('should render file upload area with drag and drop text', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      // Check if file upload area is visible
      expect(screen.getByText('Upload Bill Photo *')).toBeInTheDocument();
      expect(screen.getByText(/Click to upload/)).toBeInTheDocument();
      expect(screen.getByText(/or drag and drop/)).toBeInTheDocument();
    });
  });

  describe('Form Interaction Tests', () => {
    test('should call handleInputChange when name field is typed in', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const nameInput = screen.getByLabelText('Full Name *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      expect(mockProps.handleInputChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: 'John Doe' }
        })
      );
    });

    test('should call handleBlur when name field loses focus', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const nameInput = screen.getByLabelText('Full Name *');
      fireEvent.blur(nameInput);
      
      expect(mockProps.handleBlur).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { name: 'name', value: '' }
        })
      );
    });

    test('should call handleInputChange when city is selected', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const citySelect = screen.getByLabelText('City *');
      fireEvent.change(citySelect, { target: { value: 'mumbai' } });
      
      expect(mockProps.handleInputChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: 'mumbai' }
        })
      );
    });

    test('should call handleInputChange when date is selected', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const dobInput = screen.getByLabelText('Date of Birth *');
      fireEvent.change(dobInput, { target: { value: '1990-01-01' } });
      
      expect(mockProps.handleInputChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: '1990-01-01' }
        })
      );
    });
  });

  describe('File Upload Tests', () => {
    test('should call handleFileUpload when file is selected', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const fileInput = screen.getByLabelText(/Bill photo is required/);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(mockProps.handleFileUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { files: [file] }
        })
      );
    });

    test('should call handleDragOver when file is dragged over', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const fileUploadArea = screen.getByText(/Drag and drop your bill photo here/).closest('.file-upload-area');
      fireEvent.dragOver(fileUploadArea);
      
      expect(mockProps.handleDragOver).toHaveBeenCalled();
    });

    test('should call handleDragLeave when file drag leaves the area', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const fileUploadArea = screen.getByText(/Drag and drop your bill photo here/).closest('.file-upload-area');
      fireEvent.dragLeave(fileUploadArea);
      
      expect(mockProps.handleDragLeave).toHaveBeenCalled();
    });

    test('should call handleDrop when file is dropped', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const fileUploadArea = screen.getByText(/Drag and drop your bill photo here/).closest('.file-upload-area');
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      fireEvent.drop(fileUploadArea, {
        dataTransfer: { files: [file] }
      });
      
      expect(mockProps.handleDrop).toHaveBeenCalledWith(
        expect.objectContaining({
          dataTransfer: { files: [file] }
        })
      );
    });
  });

  describe('Error Display Tests', () => {
    test('should display name error when provided', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: { name: 'Full name is required' }
      };
      
      render(<PersonalDetailsStep {...propsWithErrors} />);
      
      expect(screen.getByText('⚠️ Full name is required')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name *')).toHaveClass('error');
    });

    test('should display date of birth error when provided', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: { dob: 'Date of birth is required' }
      };
      
      render(<PersonalDetailsStep {...propsWithErrors} />);
      
      expect(screen.getByText('⚠️ Date of birth is required')).toBeInTheDocument();
      expect(screen.getByLabelText('Date of Birth *')).toHaveClass('error');
    });

    test('should display city error when provided', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: { city: 'Please select your city from the dropdown' }
      };
      
      render(<PersonalDetailsStep {...propsWithErrors} />);
      
      expect(screen.getByText('⚠️ Please select your city from the dropdown')).toBeInTheDocument();
      expect(screen.getByLabelText('City *')).toHaveClass('error');
    });

    test('should display bill photo error when provided', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: { billPhoto: 'Bill photo is required to verify your vape purchase' }
      };
      
      render(<PersonalDetailsStep {...propsWithErrors} />);
      
      expect(screen.getByText('⚠️ Bill photo is required to verify your vape purchase')).toBeInTheDocument();
    });
  });

  describe('File Display Tests', () => {
    test('should display uploaded file information when file exists', () => {
      const propsWithFile = {
        ...mockProps,
        formData: {
          ...mockProps.formData,
          billPhoto: {
            name: 'test-bill.jpg',
            size: 1024 * 1024,
            type: 'image/jpeg'
          }
        }
      };
      
      render(<PersonalDetailsStep {...propsWithFile} />);
      
      expect(screen.getByText('test-bill.jpg')).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    test('should show remove button when file exists', () => {
      const propsWithFile = {
        ...mockProps,
        formData: {
          ...mockProps.formData,
          billPhoto: {
            name: 'test-bill.jpg',
            size: 1024 * 1024,
            type: 'image/jpeg'
          }
        }
      };
      
      render(<PersonalDetailsStep {...propsWithFile} />);
      
      const removeButton = screen.getByRole('button', { name: /remove file/i });
      expect(removeButton).toBeInTheDocument();
      
      fireEvent.click(removeButton);
      expect(mockProps.removeFile).toHaveBeenCalled();
    });
  });

  describe('Form State Tests', () => {
    test('should display current form values', () => {
      const propsWithValues = {
        ...mockProps,
        formData: {
          name: 'John Doe',
          dob: '1990-01-01',
          city: 'mumbai',
          billPhoto: null
        }
      };
      
      render(<PersonalDetailsStep {...propsWithValues} />);
      
      const nameInput = screen.getByLabelText('Full Name *');
      const dobInput = screen.getByLabelText('Date of Birth *');
      const citySelect = screen.getByLabelText('City *');
      
      expect(nameInput.value).toBe('John Doe');
      expect(dobInput.value).toBe('1990-01-01');
      expect(citySelect.value).toBe('mumbai');
    });

    test('should show validation summary when renderValidationSummary returns content', () => {
      const mockValidationSummary = (
        <div data-testid="validation-summary">
          <h4>Please fix the following issues:</h4>
          <ul>
            <li>Name is required</li>
          </ul>
        </div>
      );
      
      const propsWithValidation = {
        ...mockProps,
        renderValidationSummary: jest.fn().mockReturnValue(mockValidationSummary)
      };
      
      render(<PersonalDetailsStep {...propsWithValidation} />);
      
      expect(screen.getByTestId('validation-summary')).toBeInTheDocument();
      expect(screen.getByText('Please fix the following issues:')).toBeInTheDocument();
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    test('should have proper labels for all form fields', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      // Check if all inputs have proper labels
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Date of Birth *')).toBeInTheDocument();
      expect(screen.getByLabelText('City *')).toBeInTheDocument();
    });

    test('should have proper input types', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const nameInput = screen.getByLabelText('Full Name *');
      const dobInput = screen.getByLabelText('Date of Birth *');
      const citySelect = screen.getByLabelText('City *');
      
      expect(nameInput.type).toBe('text');
      expect(dobInput.type).toBe('date');
      expect(citySelect.tagName).toBe('SELECT');
    });

    test('should have required attributes on mandatory fields', () => {
      render(<PersonalDetailsStep {...mockProps} />);
      
      const nameInput = screen.getByLabelText('Full Name *');
      const dobInput = screen.getByLabelText('Date of Birth *');
      const citySelect = screen.getByLabelText('City *');
      
      expect(nameInput).toHaveAttribute('required');
      expect(dobInput).toHaveAttribute('required');
      expect(citySelect).toHaveAttribute('required');
    });
  });
});
