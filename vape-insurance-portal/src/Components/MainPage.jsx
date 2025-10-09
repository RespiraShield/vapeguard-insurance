import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import verificationService from '../services/verificationService';
import { isFeatureEnabled } from '../config/featureFlags';
import PersonalDetailsStep from "./PersonalDetailsStep/PersonalDetailsStep";
import InsuranceSelectionStep from "./InsuranceSelectionStep/InsuranceSelectionStep";
import PaymentStep from "./PaymentStep/PaymentStep";
import EnrollmentStep from "./EnrollmentStep/EnrollmentStep";
import SuccessStep from "./SuccessStep/SuccessStep";
import "./styles.css";

const VapeInsurancePortal = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    city: "",
    billPhoto: null,
    selectedInsurance: null,
    paymentMethod: "",
    // Payment details
    upiId: "",
    selectedBank: "",
    accountNumber: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [applicationNumber, setApplicationNumber] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [shouldScrollToError, setShouldScrollToError] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(() => {
    // Load verification status from localStorage on component mount
    const saved = localStorage.getItem('verificationStatus');
    return saved ? JSON.parse(saved) : { email: false, phone: false };
  });

  // Check backend connectivity on component mount
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const isConnected = await apiService.healthCheck();
        setBackendConnected(isConnected);
      } catch (error) {
        setBackendConnected(false);
      }
    };
    
    // Add delay and error boundary to prevent Emily AI extension conflicts
    setTimeout(() => {
      checkBackendConnection().catch(_err => {
        setBackendConnected(false);
      });
    }, 1000);
  }, []);

  const [insurancePlans, setInsurancePlans] = useState([]);

  // Fetch insurance plans on component mount
  useEffect(() => {
    const fetchInsurancePlans = async () => {
      try {
        const response = await apiService.getInsurancePlans();
        if (response.success) {
          setInsurancePlans(response.data);
        }
      } catch (error) {
        console.error('Error fetching insurance plans:', error);
      }
    };

    fetchInsurancePlans();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Don't clear dateOfBirth errors on input change - let the DatePicker handle it
    if (errors[name] && name !== 'dateOfBirth') {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };

    // Validate individual fields on blur
    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Full name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters long";
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.name = "Name can only contain letters and spaces";
        } else {
          delete newErrors.name;
        }
        break;

      case "dateOfBirth":
        // Skip validation for dateOfBirth in blur handler - let PersonalDetailsStep handle it
        break;

      case "city":
        if (!value) {
          newErrors.city = "Please select your city from the dropdown";
        } else {
          delete newErrors.city;
        }
        break;

      case "upiId":
        if (!value.trim()) {
          newErrors.upiId = "UPI ID is required";
        } else if (!/^[\w.-]+@[\w.-]+$/.test(value.trim())) {
          newErrors.upiId =
            "Please enter a valid UPI ID (e.g., yourname@paytm)";
        } else {
          delete newErrors.upiId;
        }
        break;

      case "selectedBank":
        if (!value) {
          newErrors.selectedBank = "Please select your bank";
        } else {
          delete newErrors.selectedBank;
        }
        break;

      case "accountNumber":
        if (!value.trim()) {
          newErrors.accountNumber = "Account number is required";
        } else if (!/^\d{9,18}$/.test(value.trim())) {
          newErrors.accountNumber =
            "Please enter a valid account number (9-18 digits)";
        } else {
          delete newErrors.accountNumber;
        }
        break;

      case "cardNumber":
        if (!value.trim()) {
          newErrors.cardNumber = "Card number is required";
        } else {
          const cleanedCard = value.replace(/\s/g, "");
          if (!/^\d{13,19}$/.test(cleanedCard)) {
            newErrors.cardNumber =
              "Please enter a valid card number (13-19 digits)";
          } else {
            delete newErrors.cardNumber;
          }
        }
        break;

      case "expiryDate":
        if (!value.trim()) {
          newErrors.expiryDate = "Expiry date is required";
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value.trim())) {
          newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
        } else {
          const [month, year] = value.split("/");
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear() % 100;
          const currentMonth = currentDate.getMonth() + 1;
          const expYear = parseInt(year);
          const expMonth = parseInt(month);

          if (
            expYear < currentYear ||
            (expYear === currentYear && expMonth < currentMonth)
          ) {
            newErrors.expiryDate = "Card has expired";
          } else {
            delete newErrors.expiryDate;
          }
        }
        break;

      case "cvv":
        if (!value.trim()) {
          newErrors.cvv = "CVV is required";
        } else if (!/^\d{3,4}$/.test(value.trim())) {
          newErrors.cvv = "Please enter a valid CVV (3-4 digits)";
        } else {
          delete newErrors.cvv;
        }
        break;

      case "cardholderName":
        if (!value.trim()) {
          newErrors.cardholderName = "Cardholder name is required";
        } else if (value.trim().length < 2) {
          newErrors.cardholderName = "Name must be at least 2 characters long";
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.cardholderName = "Name can only contain letters and spaces";
        } else {
          delete newErrors.cardholderName;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // OTP Verification Functions
  const handleSendOTP = async (type) => {
    // Validate email before sending OTP
    if (type === 'email') {
      if (!formData.email.trim()) {
        setErrors(prev => ({ ...prev, email: 'Please enter your email address first' }));
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
        return;
      }

      // Send OTP directly without creating user
      try {
        const response = await apiService.sendEmailOTP(formData.email, formData.name || 'User');
        setErrors(prev => ({ ...prev, email: '' }));
        return response; // Return the response for PersonalDetailsStep
      } catch (error) {
        console.error('Email OTP Error:', error);
        
        // Check if it's a duplicate email error
        if (error.message && error.message.includes('already registered and verified')) {
          setErrors(prev => ({
            ...prev,
            email: 'This email is already registered and verified. Please use a different email address.'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            email: error.message || 'Failed to send OTP. Please try again.'
          }));
        }
        throw error; // Re-throw error for PersonalDetailsStep to catch
      }
    }
  };

  const handleVerifyOTP = async (type, otp) => {
    if (type === 'email') {
      try {
        // Use pre-registration verification for step 1 (before application creation)
        await apiService.verifyEmailOTP(formData.email, otp);
        const newStatus = { ...verificationStatus, email: true };
        setVerificationStatus(newStatus);
        // Persist verification status and verified email to localStorage
        localStorage.setItem('verificationStatus', JSON.stringify(newStatus));
        localStorage.setItem('verifiedEmail', formData.email);
        setErrors(prev => ({ ...prev, email: '' }));
      } catch (error) {
        console.error('Email OTP Verification Error:', error);
        setErrors(prev => ({
          ...prev,
          email: error.message || 'Invalid OTP. Please try again.'
        }));
      }
      return;
    }

  };

  // Load verification status when application ID is available or when email changes
  useEffect(() => {
    const loadVerificationStatus = async () => {
      if (applicationId && backendConnected) {
        try {
          const response = await verificationService.getVerificationStatus(applicationId);
          const newStatus = response.data;
          setVerificationStatus(newStatus);
          // Update localStorage with backend status
          localStorage.setItem('verificationStatus', JSON.stringify(newStatus));
        } catch (error) {
          console.error('Failed to load verification status:', error);
        }
      }
    };

    loadVerificationStatus();
  }, [applicationId, backendConnected]);

  // Check if email verification status should be reset when email changes
  useEffect(() => {
    const savedEmail = localStorage.getItem('verifiedEmail');
    if (savedEmail && savedEmail !== formData.email) {
      // Email changed, reset verification status
      const resetStatus = { email: false, phone: false };
      setVerificationStatus(resetStatus);
      localStorage.setItem('verificationStatus', JSON.stringify(resetStatus));
      localStorage.removeItem('verifiedEmail');
    }
  }, [formData.email]);

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    } else if (backendConnected && !verificationStatus.email) {
      newErrors.email = "Please verify your email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const age = calculateAge(formData.dateOfBirth);
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();

      if (isNaN(selectedDate.getTime())) {
        newErrors.dateOfBirth = "Please enter a valid date";
      } else if (selectedDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      } else if (age > 100) {
        newErrors.dateOfBirth = "Please enter a valid date of birth";
      } else if (age <= 17) {
        newErrors.dateOfBirth =
          "You must be 18 years or older to apply for vape insurance";
      }
    }

    if (!formData.city) {
      newErrors.city = "Please select your city from the dropdown";
    }

    // Bill photo validation - controlled by feature flag
    if (isFeatureEnabled('BILL_PHOTO_ENABLED') && !formData.billPhoto) {
      newErrors.billPhoto =
        "Bill photo is required to verify your vape purchase";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.selectedInsurance) {
      newErrors.insurance = "Please select an insurance plan to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.paymentMethod) {
      newErrors.payment = "Please select a payment method to proceed";
    } else {
      // Map wallet to a specific provider for validation
      const paymentMethod = formData.paymentMethod === 'wallet' ? 'phonepe' : formData.paymentMethod;
      
      // Validate based on selected payment method
      if (paymentMethod === "upi") {
        if (!formData.upiId || !formData.upiId.trim()) {
          newErrors.upiId = "UPI ID is required";
        } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId.trim())) {
          newErrors.upiId = "Please enter a valid UPI ID (e.g., yourname@paytm)";
        }
      } else if (paymentMethod === "netbanking") {
        if (!formData.selectedBank) {
          newErrors.selectedBank = "Please select your bank";
        }
        if (!formData.accountNumber.trim()) {
          newErrors.accountNumber = "Account number is required";
        } else if (!/^\d{9,18}$/.test(formData.accountNumber.trim())) {
          newErrors.accountNumber =
            "Please enter a valid account number (9-18 digits)";
        }
      } else if (
        ["razorpay", "paytm", "phonepe", "gpay"].includes(
          formData.paymentMethod
        )
      ) {
        if (!formData.cardNumber.trim()) {
          newErrors.cardNumber = "Card number is required";
        } else {
          const cleanedCard = formData.cardNumber.replace(/\s/g, "");
          if (!/^\d{13,19}$/.test(cleanedCard)) {
            newErrors.cardNumber =
              "Please enter a valid card number (13-19 digits)";
          }
        }
        if (!formData.expiryDate.trim()) {
          newErrors.expiryDate = "Expiry date is required";
        } else if (
          !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate.trim())
        ) {
          newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
        }
        if (!formData.cvv.trim()) {
          newErrors.cvv = "CVV is required";
        } else if (!/^\d{3,4}$/.test(formData.cvv.trim())) {
          newErrors.cvv = "Please enter a valid CVV (3-4 digits)";
        }
        if (!formData.cardholderName.trim()) {
          newErrors.cardholderName = "Cardholder name is required";
        } else if (formData.cardholderName.trim().length < 2) {
          newErrors.cardholderName = "Name must be at least 2 characters long";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (file) => {
    // Only process file upload if feature is enabled
    if (!isFeatureEnabled('BILL_PHOTO_ENABLED')) {
      return;
    }

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          billPhoto: 'Please upload a valid image file (JPEG, PNG, or GIF)'
        }));
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          billPhoto: 'File size must be less than 10MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        billPhoto: file
      }));

      // Clear any previous errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.billPhoto;
        return newErrors;
      });

      // Upload file to backend if application exists
      if (applicationId && backendConnected) {
        try {
          setLoading(true);
          await apiService.uploadBillPhoto(applicationId, file);
          } catch (error) {
            setErrors(prev => ({
            ...prev,
            billPhoto: 'Failed to upload file. Please try again.'
          }));
        } finally {
          setLoading(false);
        }
      }
    }
  };


  const handleInsuranceSelect = (planId) => {
    setFormData(prev => ({
      ...prev,
      selectedInsurance: planId,
    }));

    // Clear insurance error when plan is selected
    if (errors.insurance) {
      setErrors(prev => ({
        ...prev,
        insurance: "",
      }));
    }
  };

  const handlePaymentMethodSelect = (method) => {
    // For wallet payments, we'll use the specific provider (phonepe, gpay, paytm)
    // The 'wallet' option is just for UI, we'll map it to a specific provider when processing
    setFormData(prev => ({
      ...prev,
      paymentMethod: method === 'wallet' ? 'phonepe' : method, // Default to phonepe for wallet
    }));

    // Clear payment error when method is selected
    if (errors.payment) {
      setErrors(prev => ({
        ...prev,
        payment: undefined
      }));
    }
  };

  const nextStep = async () => {
    try {
      setLoading(true);
      
      if (currentStep === 1) {
        const isValid = validateStep1();
        
        // If validation failed, scroll to first error
        if (!isValid) {
          setLoading(false);
          setShouldScrollToError(true);
          return;
        }
        
        if (backendConnected) {
          // Check if email is verified before creating user
          if (!verificationStatus.email) {
            setErrors(prev => ({ ...prev, email: 'Please verify your email before proceeding' }));
            setLoading(false);
            setShouldScrollToError(true);
            return;
          }

          // Submit personal details to backend (creates user after email verification)
          const response = await apiService.submitPersonalDetails({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
            city: formData.city
          });
          
          setApplicationId(response.data.applicationId);
          setApplicationNumber(response.data.applicationNumber);
          
          // Upload bill photo if feature is enabled and file exists
          if (isFeatureEnabled('BILL_PHOTO_ENABLED') && formData.billPhoto) {
            await apiService.uploadBillPhoto(response.data.applicationId, formData.billPhoto);
          }
        }
        setCurrentStep(2);
      } else if (currentStep === 2 && validateStep2()) {
        if (backendConnected && applicationId) {
          // Submit insurance selection to backend
          await apiService.selectInsurance(applicationId, formData.selectedInsurance);
        }
        // Check if payment is enabled, if not skip to enrollment step
        if (isFeatureEnabled('PAYMENT_ENABLED')) {
          setCurrentStep(3);
        } else {
          setCurrentStep(3); // Enrollment step (step 3 becomes enrollment when payment disabled)
        }
      }
    } catch (error) {
        setErrors(prev => ({
        ...prev,
        general: 'Failed to save data. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (validateStep3()) {
      try {
        setLoading(true);
        
        if (backendConnected && applicationId) {
          // Get application data first
          const appResponse = await apiService.getApplication(applicationId);
          const application = appResponse.data;
          
          // Submit payment details with dummy data
          await apiService.submitPaymentDetails(applicationId, {
            paymentMethod: formData.paymentMethod,
            upiId: formData.upiId || 'dummy@upi',
            selectedBank: formData.selectedBank || 'dummy_bank',
            accountNumber: formData.accountNumber || 'XXXXXXXXXX'
          });
          
          // Simulate payment processing
          
          // Create a dummy order with the plan amount from insurance plan
          const planPrice = application.insurancePlan?.price;
          if (!planPrice) {
            throw new Error('Invalid plan price. Please select a valid insurance plan.');
          }
          
          const orderData = {
            id: `dummy_order_${Math.random().toString(36).substr(2, 9)}`,
            amount: planPrice,
            currency: 'INR',
            receipt: `rcpt_${Math.random().toString(36).substr(2, 8)}`,
            status: 'created',
            created_at: Math.floor(Date.now() / 1000)
          };
          
          // Simulate payment verification with the order data
          const verification = await apiService.verifyPayment({
            razorpay_payment_id: `dummy_pay_${Math.random().toString(36).substr(2, 9)}`,
            razorpay_order_id: orderData.id,
            razorpay_signature: `dummy_sig_${Math.random().toString(36).substr(2, 16)}`,
            order_data: orderData  // Include full order data for verification
          });
          
          if (!verification.success) {
            throw new Error('Payment verification failed');
          }
          
          // Submit application after successful payment verification
          await apiService.submitApplication(applicationId);
          
          // Show success message with verified amount
        }
        
        setTimeout(() => {
          setCurrentStep(4);
        }, 1000);
      } catch (error) {
        console.error('Payment processing error:', error);
        setErrors(prev => ({
          ...prev,
          payment: error.message || 'Payment processing failed. Please try again.'
        }));
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle enrollment (pay later)
  const handleEnrollNow = async () => {
    try {
      setLoading(true);
      
      if (backendConnected && applicationId) {
        // Enroll application without payment
        await apiService.enrollApplication(applicationId);
        
      }
      
      setTimeout(() => {
        setCurrentStep(4);
      }, 1000);
    } catch (error) {
      console.error('Enrollment error:', error);
      setErrors(prev => ({
        ...prev,
        enrollment: error.message || 'Enrollment failed. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.name?.trim() &&
          formData.email?.trim() &&
          formData.dateOfBirth &&
          formData.city?.trim() &&
          formData.phone?.trim() &&
          // Bill photo required only if feature is enabled
          (!isFeatureEnabled('BILL_PHOTO_ENABLED') || formData.billPhoto) &&
          calculateAge(formData.dateOfBirth) > 17 &&
          verificationStatus.email === true
        );
      case 2:
        return formData.selectedInsurance;
      case 3:
        if (!formData.paymentMethod) return false;

        if (formData.paymentMethod === "upi") {
          return formData.upiId && formData.upiId.trim() !== "";
        } else if (formData.paymentMethod === "netbanking") {
          return formData.selectedBank;
        } else if (
          ["razorpay", "paytm", "phonepe", "gpay"].includes(
            formData.paymentMethod
          )
        ) {
          return (
            formData.cardNumber.trim() !== "" &&
            formData.expiryDate.trim() !== "" &&
            formData.cvv.trim() !== "" &&
            formData.cardholderName.trim() !== ""
          );
        }
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDetailsStep
            formData={formData}
            errors={errors}
            setErrors={setErrors}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur}
            handleFileChange={handleFileUpload}
            handleCityChange={(city) => setFormData(prev => ({ ...prev, city }))}
            sendEmailOTP={() => handleSendOTP('email')}
            verifyEmailOTP={(otp) => handleVerifyOTP('email', otp)}
            isEmailVerified={verificationStatus.email === true}
            scrollToError={shouldScrollToError}
            onScrollComplete={() => setShouldScrollToError(false)}
          />
        );

      case 2:
        return (
          <InsuranceSelectionStep
            selectedInsurance={formData.selectedInsurance}
            handleInsuranceSelect={handleInsuranceSelect}
            errors={errors}
          />
        );

      case 3:
        // Show enrollment step if payment is disabled, otherwise show payment step
        if (!isFeatureEnabled('PAYMENT_ENABLED')) {
          return (
            <EnrollmentStep
              selectedInsurance={formData.selectedInsurance}
              insurancePlans={insurancePlans}
              onEnrollNow={handleEnrollNow}
              loading={loading}
            />
          );
        } else {
          return (
            <PaymentStep
              formData={formData}
              errors={errors}
              handlePaymentMethodSelect={handlePaymentMethodSelect}
              handleInputChange={handleInputChange}
              handleBlur={handleBlur}
              selectedPaymentMethod={formData.paymentMethod}
            />
          );
        }

      case 4:
        return <SuccessStep applicationId={applicationId} applicationNumber={applicationNumber} />;

      default:
        return null;
    }
  };

  return (
    <>
      <div className="container">
        <div className="form-container">
          <div className="header">
            <h1 className="title">RespiraShield Insurance</h1>
            <p className="subtitle">
              Protect your health with specialized coverage designed for vape
              users. Get comprehensive respiratory and wellness protection.
            </p>
          </div>

          <div className="form-content">
            {currentStep < 4 && (
              <div className="step-indicator">
                {/* Adjust step indicator based on payment feature flag */}
                {isFeatureEnabled('PAYMENT_ENABLED') ? (
                  // Show all 3 steps when payment is enabled
                  [1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`step ${currentStep === step ? "active" : ""} ${
                        currentStep > step ? "completed" : ""
                      }`}
                    >
                      {step}
                    </div>
                  ))
                ) : (
                  // Show only 3 steps when payment is disabled (step 3 becomes enrollment)
                  [1, 2, 3].map((step) => {
                    const stepLabels = {
                      1: '1',
                      2: '2', 
                      3: '3'
                    };
                    return (
                      <div
                        key={step}
                        className={`step ${currentStep === step ? "active" : ""} ${
                          currentStep > step ? "completed" : ""
                        }`}
                      >
                        {stepLabels[step]}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {renderStepContent()}

            {currentStep < 4 && (
              <div className="button-group">
                {currentStep > 1 && (
                  <button className="button" onClick={handlePrev} disabled={loading}>
                    Previous
                  </button>
                )}
                {currentStep < 3 && (
                  <button
                    className="button primary"
                    onClick={nextStep}
                    disabled={currentStep === 1 ? loading : (!isStepValid() || loading)}
                  >
                    {loading ? 'Saving...' : 'Next Step'}
                  </button>
                )}
                {currentStep === 3 && isFeatureEnabled('PAYMENT_ENABLED') && (
                  <button
                    className="button primary"
                    onClick={handleSubmit}
                    disabled={!isStepValid() || loading}
                  >
                    {loading ? 'Processing...' : 'Complete Payment'}
                  </button>
                )}
                {/* No button needed for enrollment step as it has its own button */}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VapeInsurancePortal;
