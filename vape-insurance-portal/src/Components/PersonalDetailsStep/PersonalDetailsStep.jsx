import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Input, Select, Upload, Button, Row, Col, message, Modal, DatePicker } from 'antd';
import { MailOutlined, PhoneOutlined, UploadOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { isFeatureEnabled } from '../../config/featureFlags';
import { PERSONAL_DETAILS_STEP } from '../../constants/texts';
import styles from './PersonalDetailsStep.module.css';

const { Option } = Select;
const { Dragger } = Upload;

const PersonalDetailsStep = ({ 
  formData = {}, 
  errors = {}, 
  setErrors = () => {},
  setFormData = () => {},
  handleInputChange = () => {}, 
  handleBlur = () => {}, 
  handleFileChange = () => {},
  handleCityChange = () => {},
  sendEmailOTP = () => {},
  verifyEmailOTP = () => {},
  scrollToError = false,
  onScrollComplete = () => {},
  // sendPhoneOTP = () => {},
  // verifyPhoneOTP = () => {},
  isEmailVerified = false
  // isPhoneVerified = false
}) => {
  const [emailOTP, setEmailOTP] = useState('');
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [loadingEmailOTP, setLoadingEmailOTP] = useState(false);

  // Refs for form fields to enable scrolling to errors
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const dobRef = useRef(null);
  const cityRef = useRef(null);

  // Calculate age utility function
  const calculateAge = useCallback((dateOfBirth) => {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }, []);

  // Validate date of birth
  const validateDateOfBirth = useCallback((dateValue) => {
    if (!dateValue || dateValue.trim() === '') {
      return "Date of birth is required";
    }

    const age = calculateAge(dateValue);
    const birthDate = new Date(dateValue);
    const today = new Date();

    if (isNaN(birthDate.getTime())) {
      return "Please enter a valid date";
    }
    
    if (birthDate > today) {
      return "Date of birth cannot be in the future";
    }
    
    if (age > 100) {
      return "Please enter a valid date of birth";
    }
    
    if (age <= 17) {
      return "You must be 18 years or older to apply for vape insurance";
    }

    return null;
  }, [calculateAge]);

  // Handle date change
  const handleDateChange = useCallback((date) => {
    // Mark field as touched
    setDateFieldTouched(true);
    
    // Check if date is valid
    if (date && date.isValid()) {
      const dateValue = date.format('YYYY-MM-DD');
      
      // Update form data with valid date
      setFormData(prev => ({
        ...prev,
        dateOfBirth: dateValue
      }));
      
      // Validate the date
      const error = validateDateOfBirth(dateValue);
      setErrors(prev => ({
        ...prev,
        dateOfBirth: error || undefined // Set to undefined to remove the error when valid
      }));
    } else {
      // Clear form data for invalid or null dates
      setFormData(prev => ({
        ...prev,
        dateOfBirth: ''
      }));
      
      // Set appropriate error message
      setErrors(prev => ({
        ...prev,
        dateOfBirth: date ? 'Please enter a valid date' : 'Date of birth is required'
      }));
    }
  }, [setFormData, setErrors, validateDateOfBirth]);

  // Track if date field has been touched
  const [dateFieldTouched, setDateFieldTouched] = useState(false);

  // Handle date validation with proper touched state
  // Simplified validation function
  const handleDateValidation = useCallback((dateValue, isTouched) => {
    if (!isTouched) return;
    
    if (!dateValue) {
      setErrors(prev => ({
        ...prev,
        dateOfBirth: 'Date of birth is required'
      }));
      return;
    }
    
    const errorMessage = validateDateOfBirth(dateValue);
    setErrors(prev => ({
      ...prev,
      dateOfBirth: errorMessage || undefined
    }));
  }, [validateDateOfBirth, setErrors]);

  // Effect to validate date when it changes and field is touched
  useEffect(() => {
    if (dateFieldTouched && formData.dateOfBirth) {
      const error = validateDateOfBirth(formData.dateOfBirth);
      setErrors(prev => ({
        ...prev,
        dateOfBirth: error || undefined
      }));
    }
  }, [formData.dateOfBirth, dateFieldTouched, validateDateOfBirth, setErrors]);
  const [verifyingEmailOTP, setVerifyingEmailOTP] = useState(false);
  // const [verifyingPhoneOTP, setVerifyingPhoneOTP] = useState(false);

  // Clear OTP input when verification is completed
  React.useEffect(() => {
    if (isEmailVerified) {
      setEmailOTP('');
    }
  }, [isEmailVerified]);

  // React.useEffect(() => {
  //   if (isPhoneVerified) {
  //     setPhoneOTP('');
  //   }
  // }, [isPhoneVerified]);

  const handleSendEmailOTP = async () => {
    setLoadingEmailOTP(true);
    // Reset OTP sent state before attempting to send
    setEmailOTPSent(false);
    try {
      const response = await sendEmailOTP();
      // Only set emailOTPSent to true if response indicates success
      if (response && response.success === true) {
        setEmailOTPSent(true);
        Modal.success({
          title: 'OTP Sent!',
          content: 'Please check your email for the verification code.',
          okText: 'Got it'
        });
      }
    } catch (error) {
      // Keep OTP input hidden on error (emailOTPSent remains false)
      Modal.error({
        title: 'Failed to Send OTP',
        content: error.message || 'Please try again or check your email address.',
        okText: 'Retry'
      });
    } finally {
      setLoadingEmailOTP(false);
    }
  };

  // const handleSendPhoneOTP = async () => {
  //   setLoadingPhoneOTP(true);
  //   try {
  //     await sendPhoneOTP();
  //     setPhoneOTPSent(true);
  //     Modal.success({
  //       title: 'OTP Sent!',
  //       content: 'Please check your phone for the verification code.',
  //       okText: 'Got it'
  //     });
  //   } catch (error) {
  //     Modal.error({
  //       title: 'Error',
  //       content: 'Failed to send OTP. Please try again.',
  //       okText: 'OK'
  //     });
  //   } finally {
  //     setLoadingPhoneOTP(false);
  //   }
  // };

  const handleVerifyEmailOTP = async () => {
    if (!emailOTP || emailOTP.length !== 6) {
      message.error('Please enter a valid 6-digit OTP');
      return;
    }
    setVerifyingEmailOTP(true);
    try {
      await verifyEmailOTP(emailOTP);
      setEmailOTP('');
      Modal.success({
        title: 'Email Verified!',
        content: 'Your email has been successfully verified.',
        okText: 'Continue'
      });
    } catch (error) {
      Modal.error({
        title: 'Verification Failed',
        content: 'Invalid OTP. Please check and try again.',
        okText: 'Retry'
      });
    } finally {
      setVerifyingEmailOTP(false);
    }
  };

  // const handleVerifyPhoneOTP = async () => {
  //   if (!phoneOTP.trim()) {
  //     message.error('Please enter the OTP');
  //     return;
  //   }

  //   setVerifyingPhoneOTP(true);
  //   try {
  //     await verifyPhoneOTP(phoneOTP);
  //     Modal.success({
  //       title: 'Phone Verified!',
  //       content: 'Your phone number has been successfully verified.',
  //       okText: 'Great!'
  //     });
  //   } catch (error) {
  //     Modal.error({
  //       title: 'Verification Failed',
  //       content: 'Invalid OTP. Please check and try again.',
  //       okText: 'OK'
  //     });
  //   } finally {
  //     setVerifyingPhoneOTP(false);
  //   }
  // };

  const handleFileUpload = (file) => {
    handleFileChange(file);
    return false; // Prevent default upload behavior
  };

  const handleRemoveFile = () => {
    handleFileChange(null);
  };

  // Scroll to first error when scrollToError prop is true
  useEffect(() => {
    if (!scrollToError) return;

    const fieldRefs = {
      name: nameRef,
      email: emailRef,
      phone: phoneRef,
      dateOfBirth: dobRef,
      city: cityRef
    };

    // Find first field with error
    const firstErrorField = Object.keys(errors).find(field => errors[field] && fieldRefs[field]);
    
    if (firstErrorField && fieldRefs[firstErrorField]?.current) {
      fieldRefs[firstErrorField].current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Try to focus the input
      const input = fieldRefs[firstErrorField].current.querySelector('input, .ant-select, .ant-picker');
      if (input) {
        setTimeout(() => input.focus(), 300);
      }
    }

    // Notify parent that scroll is complete
    onScrollComplete();
  }, [scrollToError, errors, onScrollComplete]);

  return (
    <div className={styles.personalDetailsContainer}>
      <div className={styles.formCard}>
        <div className={styles.stepHeader}>
          <h1 className={styles.stepTitle}>{PERSONAL_DETAILS_STEP.TITLE}</h1>
          <p className={styles.stepSubtitle}>{PERSONAL_DETAILS_STEP.SUBTITLE}</p>
          
          {/* Login link for existing users */}
          <div className={styles.loginLinkContainer}>
            <span className={styles.loginText}>Already have an account?</span>
            <a 
              href={process.env.REACT_APP_DASHBOARD_URL || 'https://dashboard.respirashield.com'} 
              className={styles.loginLink}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = process.env.REACT_APP_DASHBOARD_URL || 'https://dashboard.respirashield.com';
              }}
            >
              Login to Dashboard →
            </a>
          </div>
        </div>

        <Form layout="vertical" size="large">
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>1</div>
              Personal Information
            </div>
            
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <div className={styles.inputGroup} ref={nameRef}>
                  <Form.Item 
                    label={<span className={styles.inputLabel}>{PERSONAL_DETAILS_STEP.FORM.NAME.LABEL.replace(' *', '')}</span>}
                    required
                    validateStatus={errors.name ? 'error' : ''}
                    help={errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
                  >
                    <Input
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder={PERSONAL_DETAILS_STEP.FORM.NAME.PLACEHOLDER}
                      className={styles.styledInput}
                      size="large"
                    />
                  </Form.Item>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div className={styles.inputGroup} ref={emailRef}>
                  <Form.Item 
                    label={<span className={styles.inputLabel}>{PERSONAL_DETAILS_STEP.FORM.EMAIL.LABEL.replace(' *', '')}</span>}
                    required
                    validateStatus={errors.email ? 'error' : ''}
                    help={errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                  >
                    <div className={styles.otpSection}>
                      <div className={styles.otpInput}>
                        <div className={styles.inputWithIcon}>
                          <MailOutlined className={styles.inputIcon} />
                          <Input
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder={PERSONAL_DETAILS_STEP.FORM.EMAIL.PLACEHOLDER}
                            className={styles.styledInput}
                            size="large"
                          />
                        </div>
                      </div>
                      {!isEmailVerified && (
                        <Button 
                          type="primary" 
                          onClick={handleSendEmailOTP}
                          disabled={!formData.email || (!!errors.email && !errors.email.includes('verify')) || loadingEmailOTP}
                          className={styles.otpButton}
                          icon={loadingEmailOTP ? <LoadingOutlined /> : null}
                        >
                          {loadingEmailOTP ? 'Sending...' : PERSONAL_DETAILS_STEP.BUTTONS.SEND_EMAIL_OTP}
                        </Button>
                      )}
                    </div>
                    {emailOTPSent && !isEmailVerified && (
                      <div className={styles.otpInputSection}>
                        <Input
                          placeholder="Enter 6-digit OTP"
                          value={emailOTP}
                          onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className={styles.otpInput}
                          size="large"
                        />
                        <Button 
                          type="primary"
                          onClick={handleVerifyEmailOTP}
                          disabled={!emailOTP || emailOTP.length !== 6 || verifyingEmailOTP}
                          className={styles.verifyButton}
                          icon={verifyingEmailOTP ? <LoadingOutlined /> : null}
                        >
                          {verifyingEmailOTP ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                      </div>
                    )}
                    {isEmailVerified && (
                      <div className={styles.verificationSuccess}>
                        <CheckCircleOutlined className={styles.successIcon} /> Email verified successfully
                      </div>
                    )}
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>2</div>
              Contact Verification
            </div>
            
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <div className={styles.inputGroup} ref={phoneRef}>
                  <Form.Item 
                    label={<span className={styles.inputLabel}>{PERSONAL_DETAILS_STEP.FORM.PHONE.LABEL.replace(' *', '')}</span>}
                    required
                    validateStatus={errors.phone ? 'error' : ''}
                    help={errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
                  >
                    <div className={styles.otpSection}>
                      <div className={styles.otpInput}>
                        <div className={styles.inputWithIcon}>
                          <PhoneOutlined className={styles.inputIcon} />
                          <Input
                            name="phone"
                            value={formData.phone || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 10) {
                                handleInputChange({ target: { name: 'phone', value } });
                              }
                            }}
                            onBlur={handleBlur}
                            placeholder={PERSONAL_DETAILS_STEP.FORM.PHONE.PLACEHOLDER}
                            className={styles.styledInput}
                            size="large"
                            maxLength={10}
                          />
                        </div>
                      </div>
                      {/* <Button 
                        type="primary" 
                        onClick={handleSendPhoneOTP}
                        disabled={!formData.phone || !!errors.phone || loadingPhoneOTP}
                        className={styles.otpButton}
                        icon={loadingPhoneOTP ? <LoadingOutlined /> : null}
                      >
                        {loadingPhoneOTP ? 'Sending...' : PERSONAL_DETAILS_STEP.BUTTONS.SEND_PHONE_OTP}
                      </Button> */}
                    </div>
                    {/* {phoneOTPSent && !isPhoneVerified && (
                      <div className={styles.otpInputSection}>
                        <Input
                          placeholder="Enter 6-digit OTP"
                          value={phoneOTP}
                          onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className={styles.otpInput}
                          size="large"
                        />
                        <Button 
                          type="primary"
                          onClick={handleVerifyPhoneOTP}
                          disabled={!phoneOTP || phoneOTP.length !== 6 || verifyingPhoneOTP}
                          className={styles.verifyButton}
                          icon={verifyingPhoneOTP ? <LoadingOutlined /> : null}
                        >
                          {verifyingPhoneOTP ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                      </div>
                    )} */}
                    {/* {isPhoneVerified && (
                      <div className={styles.verificationSuccess}>
                        <CheckCircleOutlined className={styles.successIcon} /> Phone verified successfully
                      </div>
                    )} */}
                  </Form.Item>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div className={styles.inputGroup} ref={dobRef}>
                  <Form.Item 
                    label={<span className={styles.inputLabel}>{PERSONAL_DETAILS_STEP.FORM.DOB.LABEL.replace(' *', '')}</span>}
                    required
                    validateStatus={errors.dateOfBirth ? 'error' : ''}
                    help={errors.dateOfBirth && <span className={styles.errorMessage}>{errors.dateOfBirth}</span>}
                  >
                    <DatePicker
                      key={formData.dateOfBirth || 'empty'} // Force re-render when date changes
                      value={formData.dateOfBirth && dayjs(formData.dateOfBirth, 'YYYY-MM-DD').isValid() ? dayjs(formData.dateOfBirth, 'YYYY-MM-DD') : null}
                      onChange={handleDateChange}
                      onBlur={() => {
                        setDateFieldTouched(true);
                        // Validate on blur regardless of value to show required error if empty
                        handleDateValidation(formData.dateOfBirth, true);
                      }}
                      placeholder={PERSONAL_DETAILS_STEP.FORM.DOB.PLACEHOLDER}
                      className={styles.styledInput}
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      allowClear={true}
                      disabledDate={(current) => {
                        return current && current > dayjs().endOf('day');
                      }}
                    />
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>3</div>
              Location
            </div>
            
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <div className={styles.inputGroup} ref={cityRef}>
                  <Form.Item 
                    label={<span className={styles.inputLabel}>{PERSONAL_DETAILS_STEP.FORM.CITY.LABEL.replace(' *', '')}</span>}
                    required
                    validateStatus={errors.city ? 'error' : ''}
                    help={errors.city && <span className={styles.errorMessage}>{errors.city}</span>}
                  >
                    <Select
                      value={formData.city || undefined}
                      onChange={handleCityChange}
                      placeholder={PERSONAL_DETAILS_STEP.FORM.CITY.PLACEHOLDER}
                      className={styles.citySelect}
                      showSearch
                      size="large"
                      filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {(PERSONAL_DETAILS_STEP.FORM.CITY.OPTIONS || []).map(city => (
                        <Option key={city} value={city}>{city}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </Col>

              {/* Bill photo upload - controlled by feature flag */}
              {isFeatureEnabled('BILL_PHOTO_ENABLED') && (
                <Col xs={24} sm={12}>
                  <div className={styles.inputGroup}>
                    <Form.Item 
                      label={<span className={`${styles.inputLabel} ${styles.requiredField}`}>{PERSONAL_DETAILS_STEP.FORM.BILL_PHOTO.LABEL}</span>}
                      validateStatus={errors.billPhoto ? 'error' : ''}
                      help={errors.billPhoto && <span className={styles.errorMessage}>{errors.billPhoto}</span>}
                    >
                      <Dragger
                        name="billPhoto"
                        beforeUpload={handleFileUpload}
                        showUploadList={false}
                        accept="image/*"
                        className={styles.uploadDragger}
                      >
                        <div className={styles.uploadIcon}>
                          <UploadOutlined />
                        </div>
                        <div className={styles.uploadText}>{PERSONAL_DETAILS_STEP.FORM.BILL_PHOTO.UPLOAD_TEXT}</div>
                        <div className={styles.uploadHint}>{PERSONAL_DETAILS_STEP.FORM.BILL_PHOTO.UPLOAD_HINT}</div>
                      </Dragger>
                      
                      {formData.billPhoto && (
                        <div className={styles.filePreview}>
                          <CheckCircleOutlined className={styles.fileIcon} />
                          <span>{formData.billPhoto.name}</span>
                          <button 
                            type="button" 
                            onClick={handleRemoveFile}
                            className={styles.removeFileButton}
                            aria-label="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </Form.Item>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PersonalDetailsStep;
