import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import VapeInsurancePortal from '../MainPage';

describe('CSS Loading Tests', () => {
  test('should have CSS styles applied to main container', () => {
    const { container } = render(<VapeInsurancePortal />);
    
    // Check if the main container has the expected CSS classes
    const mainContainer = container.querySelector('.container');
    expect(mainContainer).toBeInTheDocument();
    
    // Check if the container has the expected styles
    const computedStyle = window.getComputedStyle(mainContainer);
    
    // These styles should be applied from the CSS
    expect(computedStyle.display).toBe('flex');
    expect(computedStyle.alignItems).toBe('center');
    expect(computedStyle.justifyContent).toBe('center');
    expect(computedStyle.minHeight).toBe('100vh');
    expect(computedStyle.padding).toBe('20px');
  });

  test('should have form container with white background and shadow', () => {
    const { container } = render(<VapeInsurancePortal />);
    
    const formContainer = container.querySelector('.form-container');
    expect(formContainer).toBeInTheDocument();
    
    const computedStyle = window.getComputedStyle(formContainer);
    
    // Check if the white background and shadow are applied
    expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(computedStyle.borderRadius).toBe('20px');
    expect(computedStyle.boxShadow).toContain('rgb(0, 0, 0)');
  });

  test('should have header with gradient background', () => {
    const { container } = render(<VapeInsurancePortal />);
    
    const header = container.querySelector('.header');
    expect(header).toBeInTheDocument();
    
    const computedStyle = window.getComputedStyle(header);
    
    // Check if the gradient background is applied
    expect(computedStyle.background).toContain('linear-gradient');
    expect(computedStyle.color).toBe('rgb(255, 255, 255)');
    expect(computedStyle.padding).toBe('40px 30px');
  });

  test('should have step indicators with proper styling', () => {
    const { container } = render(<VapeInsurancePortal />);
    
    const stepIndicators = container.querySelector('.step-indicator');
    expect(stepIndicators).toBeInTheDocument();
    
    const computedStyle = window.getComputedStyle(stepIndicators);
    
    // Check if step indicator styles are applied
    expect(computedStyle.display).toBe('flex');
    expect(computedStyle.justifyContent).toBe('center');
    expect(computedStyle.marginBottom).toBe('40px');
    expect(computedStyle.gap).toBe('20px');
  });

  test('should have active step with blue background', () => {
    const { container } = render(<VapeInsurancePortal />);
    
    const activeStep = container.querySelector('.step.active');
    expect(activeStep).toBeInTheDocument();
    
    const computedStyle = window.getComputedStyle(activeStep);
    
    // Check if active step styles are applied
    expect(computedStyle.backgroundColor).toBe('rgb(99, 102, 241)');
    expect(computedStyle.color).toBe('rgb(255, 255, 255)');
    expect(computedStyle.borderRadius).toBe('50%');
    expect(computedStyle.width).toBe('40px');
    expect(computedStyle.height).toBe('40px');
  });

  test('should have form fields with proper styling', () => {
    const { container } = render(<VapeInsurancePortal />);
    
    const nameInput = container.querySelector('input[name="name"]');
    expect(nameInput).toBeInTheDocument();
    
    const computedStyle = window.getComputedStyle(nameInput);
    
    // Check if input styles are applied
    expect(computedStyle.border).toContain('1px solid');
    expect(computedStyle.borderRadius).toBe('8px');
    expect(computedStyle.padding).toBe('12px 16px');
  });

  test('should have button with primary styling', () => {
    const { container } = render(<VapeInsurancePortal />);
    
    const nextButton = container.querySelector('button');
    expect(nextButton).toBeInTheDocument();
    
    const computedStyle = window.getComputedStyle(nextButton);
    
    // Check if button styles are applied
    expect(computedStyle.backgroundColor).toBe('rgb(99, 102, 241)');
    expect(computedStyle.color).toBe('rgb(255, 255, 255)');
    expect(computedStyle.borderRadius).toBe('8px');
    expect(computedStyle.padding).toBe('12px 24px');
    expect(computedStyle.fontWeight).toBe('600');
  });
});
