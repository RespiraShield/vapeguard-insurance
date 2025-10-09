import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Tag, message } from 'antd';
import { 
  UserOutlined, 
  SafetyOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  BankOutlined 
} from '@ant-design/icons';
import { User, VerificationStatus, MaskedPII } from '../../../types';
import { maskEmail, maskPhone, maskPAN, maskAadhaar, maskBankAccount } from '../../../utils/auth';
import apiService from '../../../services/api';
import { VERIFICATION_COLORS, VERIFICATION_TEXT, FIELD_LABELS, MESSAGES, ACCOUNT_STATUS, DATE_FORMAT_OPTIONS } from './constants';
import { logger } from '../../../utils/logger';
import './PersonalInfo.css';

const { Title } = Typography;

interface PersonalInfoProps {
  user: User | null;
  loading?: boolean;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ user, loading = false }) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [maskedPII, setMaskedPII] = useState<MaskedPII | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadPersonalData();
  }, []);

  const loadPersonalData = async () => {
    try {
      setDataLoading(true);
      
      // Load verification status and masked PII data
      const [verificationResponse, piiResponse] = await Promise.all([
        apiService.getVerificationStatus(),
        apiService.getMaskedPII()
      ]);

      if (verificationResponse.success) {
        setVerificationStatus(verificationResponse.data);
      }

      if (piiResponse.success) {
        setMaskedPII(piiResponse.data);
      }
    } catch (error) {
      logger.error('Failed to load personal data:', error);
      message.error(MESSAGES.LOAD_ERROR);
    } finally {
      setDataLoading(false);
    }
  };

  const getVerificationTag = (status: string) => {
    const color = VERIFICATION_COLORS[status as keyof typeof VERIFICATION_COLORS] || VERIFICATION_COLORS.unverified;
    const text = VERIFICATION_TEXT[status as keyof typeof VERIFICATION_TEXT] || VERIFICATION_TEXT.unverified;
    return <Tag color={color}>{text}</Tag>;
  };

  if (!user) {
    return (
      <Card className="personal-info-card" loading={loading}>
        <div className="no-user-data">
          <UserOutlined className="no-data-icon" />
          <p>{MESSAGES.NO_USER_DATA}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="personal-info-card" loading={loading || dataLoading}>
      <div className="card-header">
        <Title level={4} className="card-title">
          <UserOutlined className="title-icon" />
          {MESSAGES.TITLE}
        </Title>
      </div>

      <div className="user-summary">
        <div className="user-avatar">
          <UserOutlined />
        </div>
        <div className="user-details">
          <Title level={5} className="user-name">{user.name}</Title>
          <p className="user-email">{maskEmail(user.email)}</p>
        </div>
      </div>

      <Descriptions 
        column={1} 
        size="small" 
        className="personal-descriptions"
        colon={false}
      >
        <Descriptions.Item 
          label={<><PhoneOutlined /> {FIELD_LABELS.PHONE}</>}
        >
          <div className="verification-item">
            <span>{maskPhone(user.phone)}</span>
            {verificationStatus && getVerificationTag(verificationStatus.phone)}
          </div>
        </Descriptions.Item>

        <Descriptions.Item 
          label={<><MailOutlined /> {FIELD_LABELS.EMAIL}</>}
        >
          <div className="verification-item">
            <span>{maskEmail(user.email)}</span>
            {verificationStatus && getVerificationTag(verificationStatus.email)}
          </div>
        </Descriptions.Item>

        <Descriptions.Item 
          label={<><SafetyOutlined /> {FIELD_LABELS.PAN}</>}
        >
          <div className="verification-item">
            <span>{maskedPII && maskedPII.pan !== MESSAGES.NOT_PROVIDED ? maskPAN(maskedPII.pan) : MESSAGES.NOT_PROVIDED}</span>
            {verificationStatus && getVerificationTag(verificationStatus.pan)}
          </div>
        </Descriptions.Item>

        <Descriptions.Item 
          label={<><SafetyOutlined /> {FIELD_LABELS.AADHAAR}</>}
        >
          <div className="verification-item">
            <span>{maskedPII && maskedPII.aadhaar !== MESSAGES.NOT_PROVIDED ? maskAadhaar(maskedPII.aadhaar) : MESSAGES.NOT_PROVIDED}</span>
            {verificationStatus && getVerificationTag(verificationStatus.aadhaar)}
          </div>
        </Descriptions.Item>

        <Descriptions.Item 
          label={<><BankOutlined /> {FIELD_LABELS.BANK_ACCOUNT}</>}
        >
          <div className="verification-item">
            <span>{maskedPII && maskedPII.bankAccount !== MESSAGES.NOT_PROVIDED ? maskBankAccount(maskedPII.bankAccount) : MESSAGES.NOT_PROVIDED}</span>
            {verificationStatus && getVerificationTag(verificationStatus.bank)}
          </div>
        </Descriptions.Item>
      </Descriptions>

      <div className="account-info">
        <Descriptions column={1} size="small">
          <Descriptions.Item label={FIELD_LABELS.MEMBER_SINCE}>
            {new Date(user.createdAt).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)}
          </Descriptions.Item>
          <Descriptions.Item label={FIELD_LABELS.ACCOUNT_STATUS}>
            <Tag color={user.isActive ? 'green' : 'red'}>
              {user.isActive ? ACCOUNT_STATUS.ACTIVE : ACCOUNT_STATUS.INACTIVE}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Card>
  );
};

export default PersonalInfo;
