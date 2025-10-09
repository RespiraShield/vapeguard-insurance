import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, message, Button, Modal } from 'antd';
import { LogoutOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import PlanDetails from './PlanDetails';
import PaymentChart from './PaymentChart';
import ApplicationInfo from './ApplicationInfo';
import PersonalInfo from './PersonalInfo';
import apiService from '../../services/api';
import { DashboardData } from '../../types';
import { logger } from '../../utils/logger';
import './Dashboard.css';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiService.getDashboardData();
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        message.error('Failed to load dashboard data');
      }
    } catch (error) {
      logger.error('Dashboard load error:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const showLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setLogoutModalVisible(false);
      await logout();
      message.success('Logged out successfully');
    } catch (error) {
      message.error('Logout failed');
    }
  };

  const handleLogoutCancel = () => {
    setLogoutModalVisible(false);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <Title level={2} className="dashboard-title">
              Welcome back, {user?.name}
            </Title>
          </div>
          <div className="header-right">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
              className="refresh-button"
            >
              Refresh
            </Button>
            <Button
              icon={<LogoutOutlined />}
              onClick={showLogoutModal}
              type="text"
              className="logout-button"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <Row gutter={[24, 24]}>
          {/* Left Column - Main Content */}
          <Col xs={24} lg={16}>
            <div className="main-content">
              {/* Insurance Plan Details */}
              <PlanDetails 
                plan={dashboardData?.currentPlan || null}
                dashboardData={dashboardData}
                loading={refreshing}
              />

              {/* Payment Chart */}
              <PaymentChart 
                payments={dashboardData?.monthlyPayments || []} 
                loading={refreshing}
              />

              {/* Application & Policy Information */}
              <ApplicationInfo 
                applications={dashboardData?.applications || []} 
                loading={refreshing}
              />
            </div>
          </Col>

          {/* Right Column - Personal Info */}
          <Col xs={24} lg={8}>
            <PersonalInfo 
              user={dashboardData?.user || user} 
              loading={refreshing}
            />
          </Col>
        </Row>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />
            <span>Confirm Logout</span>
          </div>
        }
        open={logoutModalVisible}
        onOk={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        okText="Yes, Logout"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to logout?</p>
        <p style={{ color: '#8c8c8c', fontSize: '14px' }}>You will need to login again to access your dashboard.</p>
      </Modal>
    </div>
  );
};

export default Dashboard;
