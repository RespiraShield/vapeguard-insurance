import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import VapeInsurancePortal from '../MainPage';

// Import the CSS file directly to test if it can be loaded
import '../styles.css';

describe('CSS Import Tests', () => {
  test('should be able to import CSS file', () => {
    // This test will fail if the CSS file cannot be imported
    expect(true).toBe(true);
    console.log('✅ CSS file imported successfully');
  });

  test('should render component with CSS classes', () => {
    const { container } = render(<VapeInsurancePortal />);
    
    // Check if CSS classes are present in the DOM
    const mainContainer = container.querySelector('.container');
    expect(mainContainer).toBeInTheDocument();
    console.log('✅ Main container found with CSS class');
    
    const formContainer = container.querySelector('.form-container');
    expect(formContainer).toBeInTheDocument();
    console.log('✅ Form container found with CSS class');
    
    const header = container.querySelector('.header');
    expect(header).toBeInTheDocument();
    console.log('✅ Header found with CSS class');
    
    const stepIndicator = container.querySelector('.step-indicator');
    expect(stepIndicator).toBeInTheDocument();
    console.log('✅ Step indicator found with CSS class');
    
    const activeStep = container.querySelector('.step.active');
    expect(activeStep).toBeInTheDocument();
    console.log('✅ Active step found with CSS class');
  });

  test('should have CSS classes in HTML output', () => {
    const { container } = render(<VapeInsurancePortal />);
    
    // Get the HTML output and check if CSS classes are present
    const html = container.innerHTML;
    
    // Check for key CSS classes
    expect(html).toContain('class="container"');
    expect(html).toContain('class="form-container"');
    expect(html).toContain('class="header"');
    expect(html).toContain('class="step-indicator"');
    expect(html).toContain('class="step active"');
    
    console.log('✅ All expected CSS classes found in HTML output');
  });
});
