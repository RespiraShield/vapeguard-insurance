import React from 'react';
import { Input, Radio, Space, Select } from 'antd';
import { MobileOutlined, BankOutlined, CheckCircleOutlined, SafetyOutlined, GoogleOutlined, PayCircleOutlined, QrcodeOutlined } from '@ant-design/icons';
import { PAYMENT_STEP } from '../../constants/texts';
import styles from './PaymentStep.module.css';

const { Option } = Select;

const PaymentStep = ({ 
  formData = {}, 
  errors = {}, 
  handlePaymentMethodSelect = () => {}, 
  handleInputChange = () => {}, 
  handleBlur = () => {}, 
  selectedPaymentMethod = null 
}) => {
  const paymentMethods = [
    {
      id: 'upi',
      name: PAYMENT_STEP.METHODS.UPI.NAME,
      description: PAYMENT_STEP.METHODS.UPI.DESCRIPTION,
      icon: <MobileOutlined />,
      popular: true
    },
    {
      id: 'netbanking',
      name: PAYMENT_STEP.METHODS.NET_BANKING.NAME,
      description: PAYMENT_STEP.METHODS.NET_BANKING.DESCRIPTION,
      icon: <BankOutlined />
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      description: 'Pay using PhonePe UPI or Wallet',
      icon: <QrcodeOutlined style={{ color: '#5f259f' }} />
    },
    {
      id: 'gpay',
      name: 'Google Pay',
      description: 'Pay using Google Pay UPI or Wallet',
      icon: <GoogleOutlined style={{ color: '#4285F4' }} />
    },
    {
      id: 'paytm',
      name: 'Paytm',
      description: 'Pay using Paytm Wallet or UPI',
      icon: <PayCircleOutlined style={{ color: '#00baf2' }} />
    }
  ];

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentHeader}>
        <h2 className={styles.paymentTitle}>{PAYMENT_STEP.TITLE}</h2>
        <p className={styles.paymentSubtitle}>{PAYMENT_STEP.SUBTITLE}</p>
      </div>

      <div className={styles.paymentContent}>
        <Radio.Group 
          value={selectedPaymentMethod} 
          onChange={(e) => handlePaymentMethodSelect(e.target.value)}
          className={styles.paymentMethods}
        >
          <Space direction="vertical" size={0} className={styles.methodsList}>
            {paymentMethods.map((method) => (
              <Radio.Button
                key={method.id}
                value={method.id}
                className={`${styles.methodOption} ${selectedPaymentMethod === method.id ? styles.selectedMethod : ''}`}
              >
                <div className={styles.methodLayout}>
                  <div className={styles.methodLeft}>
                    <div className={styles.methodIconWrapper}>
                      {method.icon}
                    </div>
                    <div className={styles.methodDetails}>
                      <div className={styles.methodNameRow}>
                        <span className={styles.methodName}>{method.name}</span>
                        {method.popular && <span className={styles.popularTag}>RECOMMENDED</span>}
                      </div>
                      <span className={styles.methodDesc}>{method.description}</span>
                    </div>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <CheckCircleOutlined className={styles.checkIcon} />
                  )}
                </div>
              </Radio.Button>
            ))}
          </Space>
        </Radio.Group>

        {selectedPaymentMethod === 'upi' && (
          <div className={styles.paymentForm}>
            <div className={styles.formHeader}>
              <span className={styles.formTitle}>{PAYMENT_STEP.UPI_FORM.LABEL}</span>
            </div>
            <Input
              name="upiId"
              value={formData.upiId || ''}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="yourname@paytm"
              className={styles.paymentInput}
              size="large"
            />
            {errors.upiId && (
              <div className={styles.inputError}>{errors.upiId}</div>
            )}
            <div className={styles.inputHint}>For example: 9876543210@paytm</div>
          </div>
        )}

        {selectedPaymentMethod === 'netbanking' && (
          <div className={styles.paymentForm}>
            <div className={styles.formHeader}>
              <span className={styles.formTitle}>Select Your Bank</span>
            </div>
            <Select
              name="selectedBank"
              value={formData.selectedBank || undefined}
              onChange={(value) => handleInputChange({ target: { name: 'selectedBank', value } })}
              onBlur={handleBlur}
              placeholder="Choose your bank"
              className={styles.bankSelect}
              size="large"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="sbi">State Bank of India</Option>
              <Option value="hdfc">HDFC Bank</Option>
              <Option value="icici">ICICI Bank</Option>
              <Option value="axis">Axis Bank</Option>
              <Option value="kotak">Kotak Mahindra Bank</Option>
              <Option value="pnb">Punjab National Bank</Option>
              <Option value="bob">Bank of Baroda</Option>
              <Option value="canara">Canara Bank</Option>
            </Select>
            {errors.selectedBank && (
              <div className={styles.inputError}>{errors.selectedBank}</div>
            )}
            <div className={styles.inputHint}>You'll be redirected to your bank's secure login</div>
          </div>
        )}
      </div>

      {errors.paymentMethod && (
        <div className={styles.paymentError}>{errors.paymentMethod}</div>
      )}

      <div className={styles.securityNote}>
        <SafetyOutlined className={styles.securityIcon} />
        <span>100% secure payments</span>
      </div>
    </div>
  );
};

export default PaymentStep;
