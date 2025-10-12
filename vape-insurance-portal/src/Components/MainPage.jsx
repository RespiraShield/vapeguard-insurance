import React, { useState, useEffect, useRef } from 'react';
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
  // Helper function to check if email is verified (handles both boolean and object formats)
  const isEmailVerified = (status) => {
    if (typeof status.email === 'object') {
      return status.email.verified === true;
    }
    return status.email === true;
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    city: "",
    billPhoto: null,
    vapingFrequencyValue: "",
    vapingFrequencyCadence: "",
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
  const [verificationStatus, setVerificationStatus] = useState({ email: false, phone: false });
  const [savedStep1Data, setSavedStep1Data] = useState(null);

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
  const plansFetchedRef = useRef(false);

  useEffect(() => {
    const fetchInsurancePlans = async () => {
      if (plansFetchedRef.current) return;
      plansFetchedRef.current = true;
      
      try {
        const response = await apiService.getInsurancePlans();
        if (response.success) {
          setInsurancePlans(response.data);
        }
      } catch (error) {
        console.error('Error fetching insurance plans:', error);
        plansFetchedRef.current = false;
      }
    };

    fetchInsurancePlans();
  }, []);

  // Get dynamic max value based on cadence
  const getMaxVapingFrequency = (cadence) => {
    const limits = {
      per_day: 30,      // Max 30 times per day
      per_week: 200,    // Max ~28 times per day
      per_month: 900,   // Max 30 times per day
      per_year: 10000   // Max ~27 times per day
    };
    return limits[cadence] || 999;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Apply smart limits for vaping frequency value
    if (name === 'vapingFrequencyValue') {
      const numValue = parseInt(value);
      const maxLimit = getMaxVapingFrequency(formData.vapingFrequencyCadence);
      
      // Prevent entering values beyond the limit
      if (value && (!isNaN(numValue) && numValue > maxLimit)) {
        return; // Don't update if exceeds limit
      }
    }
    
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

      case "phone":
        if (!value.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (value.trim().length !== 10) {
          newErrors.phone = "Phone number must be exactly 10 digits";
        } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
          newErrors.phone = "Phone number must start with 6, 7, 8, or 9";
        } else {
          delete newErrors.phone;
        }
        break;

      case "vapingFrequencyValue":
        if (!value.trim()) {
          newErrors.vapingFrequencyValue = "Vaping frequency value is required";
        } else {
          const numValue = parseInt(value.trim());
          const maxLimit = getMaxVapingFrequency(formData.vapingFrequencyCadence);
          
          if (isNaN(numValue) || numValue < 1) {
            newErrors.vapingFrequencyValue = "Please enter a valid number (minimum 1)";
          } else if (numValue > maxLimit) {
            const cadenceLabel = {
              per_day: 'per day',
              per_week: 'per week',
              per_month: 'per month',
              per_year: 'per year'
            }[formData.vapingFrequencyCadence] || '';
            newErrors.vapingFrequencyValue = `Maximum ${maxLimit} times ${cadenceLabel}`;
          } else {
            delete newErrors.vapingFrequencyValue;
          }
        }
        break;

      case "vapingFrequencyCadence":
        if (!value) {
          newErrors.vapingFrequencyCadence = "Please select a frequency cadence";
        } else {
          delete newErrors.vapingFrequencyCadence;
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

  // Recommend insurance plan based on vaping frequency
  const recommendPlanBasedOnFrequency = (value, cadence) => {
    if (!value || !cadence || insurancePlans.length === 0) return null;
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) return null;
    
    // Convert to annual frequency for comparison
    let annualFrequency = numValue;
    switch (cadence) {
      case 'per_day':
        annualFrequency = numValue * 365;
        break;
      case 'per_week':
        annualFrequency = numValue * 52;
        break;
      case 'per_month':
        annualFrequency = numValue * 12;
        break;
      case 'per_year':
        annualFrequency = numValue;
        break;
      default:
        break;
    }
    
    // Sort plans by price (assuming higher price = more comprehensive)
    const sortedPlans = [...insurancePlans].sort((a, b) => a.price - b.price);
    
    // Recommend based on frequency thresholds
    if (annualFrequency >= 1825) { // 5+ times per day
      // Highest tier plan
      return sortedPlans[sortedPlans.length - 1]?._id;
    } else if (annualFrequency >= 730) { // 2-4 times per day
      // Mid-high tier plan
      const midHighIndex = Math.floor(sortedPlans.length * 0.75);
      return sortedPlans[midHighIndex]?._id;
    } else if (annualFrequency >= 365) { // Once per day
      // Mid tier plan
      const midIndex = Math.floor(sortedPlans.length / 2);
      return sortedPlans[midIndex]?._id;
    } else {
      // Basic plan for lighter usage
      return sortedPlans[0]?._id;
    }
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

  // Restore verification status when navigating to step 1
  useEffect(() => {
    if (currentStep === 1 && formData.email) {
      const savedEmail = localStorage.getItem('verifiedEmail');
      const savedStatus = localStorage.getItem('verificationStatus');
      
      if (savedEmail === formData.email && savedStatus) {
        const parsedStatus = JSON.parse(savedStatus);
        
        // Handle both simple boolean format and complex object format from backend
        const savedEmailVerified = typeof parsedStatus.email === 'object' 
          ? parsedStatus.email.verified 
          : parsedStatus.email;
        
        const currentEmailVerified = typeof verificationStatus.email === 'object'
          ? verificationStatus.email.verified
          : verificationStatus.email;
        
        if (savedEmailVerified && !currentEmailVerified) {
          // Normalize to simple boolean format
          const normalizedStatus = {
            email: savedEmailVerified,
            phone: typeof parsedStatus.phone === 'object' ? parsedStatus.phone.verified : parsedStatus.phone
          };
          setVerificationStatus(normalizedStatus);
          localStorage.setItem('verificationStatus', JSON.stringify(normalizedStatus));
        }
      } else if (savedEmail && savedEmail !== formData.email) {
        const currentEmailVerified = typeof verificationStatus.email === 'object'
          ? verificationStatus.email.verified
          : verificationStatus.email;
          
        if (currentEmailVerified) {
          const resetStatus = { email: false, phone: false };
          setVerificationStatus(resetStatus);
          localStorage.setItem('verificationStatus', JSON.stringify(resetStatus));
          localStorage.removeItem('verifiedEmail');
        }
      }
    }
  }, [currentStep, formData.email, verificationStatus.email]);

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
    } else if (backendConnected && !isEmailVerified(verificationStatus)) {
      newErrors.email = "Please verify your email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.trim().length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must start with 6, 7, 8, or 9";
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

    // Vaping frequency validation
    if (!formData.vapingFrequencyValue || !formData.vapingFrequencyValue.toString().trim()) {
      newErrors.vapingFrequencyValue = "Vaping frequency value is required";
    } else {
      const numValue = parseInt(formData.vapingFrequencyValue.toString().trim());
      const maxLimit = getMaxVapingFrequency(formData.vapingFrequencyCadence);
      
      if (isNaN(numValue) || numValue < 1) {
        newErrors.vapingFrequencyValue = "Please enter a valid number (minimum 1)";
      } else if (numValue > maxLimit) {
        const cadenceLabel = {
          per_day: 'per day',
          per_week: 'per week',
          per_month: 'per month',
          per_year: 'per year'
        }[formData.vapingFrequencyCadence] || '';
        newErrors.vapingFrequencyValue = `Maximum ${maxLimit} times ${cadenceLabel}`;
      }
    }

    if (!formData.vapingFrequencyCadence) {
      newErrors.vapingFrequencyCadence = "Please select a frequency cadence";
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
          if (!isEmailVerified(verificationStatus)) {
            setErrors(prev => ({ ...prev, email: 'Please verify your email before proceeding' }));
            setLoading(false);
            setShouldScrollToError(true);
            return;
          }

          // Prepare data for comparison and API call
          const currentFormData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            city: formData.city,
            vapingFrequencyValue: formData.vapingFrequencyValue,
            vapingFrequencyCadence: formData.vapingFrequencyCadence
          };

          // Check if data has changed since last save
          const hasDataChanged = !savedStep1Data || 
            JSON.stringify(currentFormData) !== JSON.stringify(savedStep1Data);

          // Only make API call if data has changed
          if (hasDataChanged) {
            // Format data for API
            const apiPayload = {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
              city: formData.city,
              vapingFrequencyValue: parseInt(formData.vapingFrequencyValue),
              vapingFrequencyCadence: formData.vapingFrequencyCadence
            };

            // Update existing application or create new one
            const response = applicationId
              ? await apiService.updatePersonalDetails(applicationId, apiPayload)
              : await apiService.submitPersonalDetails(apiPayload);
            
            // Store applicationId and applicationNumber if this is a new application
            if (!applicationId) {
              setApplicationId(response.data.applicationId);
              setApplicationNumber(response.data.applicationNumber);
            }
            
            // Save to localStorage and state
            localStorage.setItem('vapeguard_step1', JSON.stringify(currentFormData));
            setSavedStep1Data(currentFormData);
            
            // Upload bill photo if feature is enabled
            if (isFeatureEnabled('BILL_PHOTO_ENABLED') && formData.billPhoto) {
              await apiService.uploadBillPhoto(response.data.applicationId, formData.billPhoto);
            }
          }
        }
        
        // Auto-select insurance plan based on current vaping frequency
        if (insurancePlans.length > 0) {
          const recommendedPlan = recommendPlanBasedOnFrequency(
            formData.vapingFrequencyValue, 
            formData.vapingFrequencyCadence
          );
          
          // Update plan if recommendation exists and is different from current selection
          if (recommendedPlan && recommendedPlan !== formData.selectedInsurance) {
            setFormData(prev => ({
              ...prev,
              selectedInsurance: recommendedPlan
            }));
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
          formData.vapingFrequencyValue &&
          formData.vapingFrequencyCadence &&
          // Bill photo required only if feature is enabled
          (!isFeatureEnabled('BILL_PHOTO_ENABLED') || formData.billPhoto) &&
          calculateAge(formData.dateOfBirth) > 17 &&
          isEmailVerified(verificationStatus)
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
            isEmailVerified={isEmailVerified(verificationStatus)}
            scrollToError={shouldScrollToError}
            onScrollComplete={() => setShouldScrollToError(false)}
            maxVapingFrequency={getMaxVapingFrequency(formData.vapingFrequencyCadence)}
            isEmailLocked={!!applicationId}
          />
        );

      case 2:
        return (
          <InsuranceSelectionStep
            selectedInsurance={formData.selectedInsurance}
            handleInsuranceSelect={handleInsuranceSelect}
            errors={errors}
            insurancePlans={insurancePlans}
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
