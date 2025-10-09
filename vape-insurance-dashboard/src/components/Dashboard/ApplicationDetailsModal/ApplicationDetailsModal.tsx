import React from 'react';
import { Modal, Typography, Descriptions, Tag, Button } from 'antd';
import { FileTextOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined, SyncOutlined, CloseCircleOutlined, FileProtectOutlined } from '@ant-design/icons';
import { Application } from '../../../types';
import { STATUS_COLORS, STATUS_TEXT } from './constants';
import './ApplicationDetailsModal.css';

const { Title, Text } = Typography;

interface ApplicationDetailsModalProps {
  visible: boolean;
  application: Application | null;
  onClose: () => void;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  visible,
  application,
  onClose,
}) => {
  if (!application) return null;

  const getStatusColor = (status: string) => STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default';
  
  const getStatusText = (status: string) => STATUS_TEXT[status as keyof typeof STATUS_TEXT] || status;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircleOutlined />;
      case 'under_review':
        return <SyncOutlined spin />;
      case 'submitted':
        return <FileProtectOutlined />;
      case 'payment_pending':
        return <ClockCircleOutlined />;
      case 'rejected':
        return <CloseCircleOutlined />;
      case 'draft':
        return <FileTextOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={550}
      className="application-details-modal"
    >
      <div className="app-modal-header">
        <div className="app-modal-icon-wrapper">
          <FileTextOutlined className="app-modal-icon" />
        </div>
        <Title level={4} className="app-modal-title">Application Details</Title>
        <Tag 
          icon={getStatusIcon(application.status)}
          color={getStatusColor(application.status)} 
          className="app-modal-status-tag status-tag-enhanced"
        >
          {getStatusText(application.status)}
        </Tag>
      </div>

      <div className="app-modal-section">
        <div className="section-header">
          <FileTextOutlined className="section-icon" />
          <Text strong className="section-title">Application Information</Text>
        </div>
        <Descriptions column={1} size="small" className="app-descriptions">
          <Descriptions.Item label="Application Number">
            <Text strong className="app-number">{application.applicationNumber}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag 
              icon={getStatusIcon(application.status)}
              color={getStatusColor(application.status)}
              className="status-tag-enhanced"
            >
              {getStatusText(application.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Submitted Date">
            {formatDate(application.submittedAt || application.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Created Date">
            {formatDate(application.createdAt)}
          </Descriptions.Item>
          {application.completedAt && (
            <Descriptions.Item label="Completed Date">
              {formatDate(application.completedAt)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      <div className="app-modal-section">
        <div className="section-header">
          <CalendarOutlined className="section-icon" />
          <Text strong className="section-title">Timeline</Text>
        </div>
        <div className="timeline">
          <div className="timeline-item completed">
            <CheckCircleOutlined className="timeline-icon" />
            <div className="timeline-content">
              <Text strong>Application Created</Text>
              <Text type="secondary">{formatDate(application.createdAt)}</Text>
            </div>
          </div>
          {application.submittedAt && (
            <div className="timeline-item completed">
              <CheckCircleOutlined className="timeline-icon" />
              <div className="timeline-content">
                <Text strong>Application Submitted</Text>
                <Text type="secondary">{formatDate(application.submittedAt)}</Text>
              </div>
            </div>
          )}
          {application.status === 'payment_pending' && (
            <div className="timeline-item pending">
              <ClockCircleOutlined className="timeline-icon" />
              <div className="timeline-content">
                <Text strong>Awaiting Payment</Text>
                <Text type="secondary">Payment confirmation pending</Text>
              </div>
            </div>
          )}
          {application.completedAt && (
            <div className="timeline-item completed">
              <CheckCircleOutlined className="timeline-icon" />
              <div className="timeline-content">
                <Text strong>Application Completed</Text>
                <Text type="secondary">{formatDate(application.completedAt)}</Text>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="app-modal-footer">
        {(application.status === 'completed' || application.status === 'approved') && (
          <Button type="primary" icon={<DownloadOutlined />} size="large" block className="app-action-button">
            Download Policy Document
          </Button>
        )}
        <Button type="primary" size="large" onClick={onClose} block className="app-close-button">
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ApplicationDetailsModal;
