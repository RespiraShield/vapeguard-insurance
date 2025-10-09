// Login Form Component for VapeGuard Insurance Dashboard
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { MailOutlined, SafetyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import './LoginForm.css';

const { Title, Text, Link } = Typography;

interface LoginFormProps {
  onRedirectToRegistration?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onRedirectToRegistration }) => {
  const [form] = Form.useForm();
  const [email, setEmail] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [countdown, setCountdown] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [otpSent, setOtpSent] = useState(false);
  const { login, error, clearError } = useAuth();
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleEmailSubmit = async (values: { email: string }) => {
    try {
      clearError();
      
      // Check if user exists
      const userCheckResponse = await apiService.checkUserExists(values.email);
      
      if (!userCheckResponse.success || !userCheckResponse.data?.exists) {
        message.warning('No account found with this email. Redirecting to registration...');
        setTimeout(() => {
          if (onRedirectToRegistration) {
            onRedirectToRegistration();
          } else {
            window.location.href = 'http://localhost:3000'; // Redirect to registration portal
          }
        }, 2000);
        return;
      }

      // Send OTP
      setOtpLoading(true);
      const otpResponse = await apiService.sendLoginOTP(values.email);
      
      if (otpResponse.success) {
        setEmail(values.email);
        setStep('otp');
        setOtpSent(true);
        message.success('OTP sent to your email address');
      } else {
        message.error(otpResponse.error || 'Failed to send OTP');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
      message.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpSubmit = async (values: { otp: string }) => {
    try {
      await login(email, values.otp);
      message.success('Login successful!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      message.error(errorMessage);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      const response = await apiService.sendLoginOTP(email);
      
      if (response.success) {
        message.success('OTP resent successfully');
      } else {
        message.error(response.error || 'Failed to resend OTP');
      }
    } catch (error) {
      message.error('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtpSent(false);
    form.resetFields();
  };

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <div className="logo-section">
            <SafetyOutlined className="logo-icon" />
            <Title level={2} className="app-title">VapeGuard</Title>
          </div>
          <Text className="login-subtitle">Insurance Dashboard</Text>
        </div>

        <Divider />

        {step === 'email' ? (
          <Form
            form={form}
            name="email-form"
            onFinish={handleEmailSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your registered email"
                autoComplete="email"
              />
            </Form.Item>

            {error && (
              <div className="error-message">
                <Text type="danger">{error}</Text>
              </div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={otpLoading}
                block
                className="login-button"
              >
                Continue with Email
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form
            form={form}
            name="otp-form"
            onFinish={handleOtpSubmit}
            layout="vertical"
            size="large"
          >
            <div className="otp-info">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToEmail}
                className="back-button"
              >
                Back
              </Button>
              <Text className="otp-description">
                We've sent a 6-digit verification code to
              </Text>
              <Text strong className="email-display">{email}</Text>
            </div>

            <Form.Item
              name="otp"
              label="Verification Code"
              rules={[
                { required: true, message: 'Please enter the verification code' },
                { len: 6, message: 'Verification code must be 6 digits' },
                { pattern: /^\d{6}$/, message: 'Please enter a valid 6-digit code' },
              ]}
            >
              <Input
                placeholder="Enter 6-digit code"
                maxLength={6}
                autoComplete="one-time-code"
                className="otp-input"
              />
            </Form.Item>

            {error && (
              <div className="error-message">
                <Text type="danger">{error}</Text>
              </div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-button"
              >
                Verify & Login
              </Button>
            </Form.Item>

            <div className="resend-section">
              <Text>Didn't receive the code? </Text>
              <Button
                type="link"
                onClick={handleResendOtp}
                loading={resendLoading}
                className="resend-button"
              >
                Resend Code
              </Button>
            </div>
          </Form>
        )}

        <Divider />

        <div className="registration-link">
          <Text>Don't have an account? </Text>
          <Link
            onClick={onRedirectToRegistration || (() => window.location.href = 'http://localhost:3000')}
          >
            Register for VapeGuard Insurance
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
