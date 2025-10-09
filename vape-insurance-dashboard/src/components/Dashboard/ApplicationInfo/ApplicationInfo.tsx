import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Space, message } from 'antd';
import { FileTextOutlined, DownloadOutlined, EyeOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, CloseCircleOutlined, FileProtectOutlined } from '@ant-design/icons';
import { Application } from '../../../types';
import ApplicationDetailsModal from '../ApplicationDetailsModal';
import { STATUS_COLORS, STATUS_TEXT } from './constants';
import { logger } from '../../../utils/logger';
import './ApplicationInfo.css';

const { Title, Text } = Typography;

interface ApplicationInfoProps {
  applications: Application[];
  loading?: boolean;
}

const ApplicationInfo: React.FC<ApplicationInfoProps> = ({ applications, loading = false }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getStatusColor = (status: string) => STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default';
  
  const getStatusText = (status: string) => STATUS_TEXT[status as keyof typeof STATUS_TEXT] || status;

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

  const renderStatusTag = (status: string) => {
    return (
      <Tag 
        icon={getStatusIcon(status)} 
        color={getStatusColor(status)}
        className="status-tag-enhanced"
      >
        {getStatusText(status)}
      </Tag>
    );
  };

  const handleDownloadPolicy = (applicationId: string) => {
    logger.info('Download policy for:', applicationId);
  };

  const handleViewDetails = (applicationId: string) => {
    const application = applications.find(app => app._id === applicationId);
    if (!application) {
      message.error('Application not found');
      return;
    }

    setSelectedApplication(application);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedApplication(null);
  };

  const columns = [
    {
      title: 'Application Number',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text: string) => (
        <span className="application-number">{text}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => renderStatusTag(status),
    },
    {
      title: 'Submitted Date',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string, record: Application) => 
        date ? new Date(date).toLocaleDateString() : 
        record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'Not submitted',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Application) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record._id)}
          >
            View
          </Button>
          {(record.status === 'completed' || record.status === 'approved') && (
            <Button
              type="text"
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleDownloadPolicy(record._id)}
            >
              Policy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="application-info-card" loading={loading}>
      <div className="card-header">
        <Title level={4} className="card-title">
          <FileTextOutlined className="title-icon" />
          Applications & Policies
        </Title>
      </div>

      {applications.length > 0 ? (
        isMobile ? (
          <div className="mobile-applications-list">
            {applications.map((app) => (
              <Card key={app._id} className="mobile-application-card" bordered={false}>
                <div className="mobile-app-header">
                  <Text strong className="mobile-app-number">{app.applicationNumber}</Text>
                  {renderStatusTag(app.status)}
                </div>
                <div className="mobile-app-info">
                  <div className="mobile-app-row">
                    <CalendarOutlined className="mobile-app-icon" />
                    <Text type="secondary">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 
                       app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Not submitted'}
                    </Text>
                  </div>
                </div>
                <div className="mobile-app-actions">
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(app._id)}
                    block
                  >
                    View Details
                  </Button>
                  {(app.status === 'completed' || app.status === 'approved') && (
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownloadPolicy(app._id)}
                      block
                    >
                      Download Policy
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={applications}
            rowKey="_id"
            pagination={false}
            size="middle"
            className="applications-table"
            scroll={{ x: 800 }}
          />
        )
      ) : (
        <div className="no-applications">
          <FileTextOutlined className="no-data-icon" />
          <p>No applications found</p>
        </div>
      )}

      <ApplicationDetailsModal
        visible={isModalVisible}
        application={selectedApplication}
        onClose={handleCloseModal}
      />
    </Card>
  );
};

export default ApplicationInfo;
