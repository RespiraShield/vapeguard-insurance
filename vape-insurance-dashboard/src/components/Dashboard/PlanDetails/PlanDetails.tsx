import React, { useState } from 'react';
import { Card, Typography, Tag, Progress, Modal, Button, Divider, Row, Col } from 'antd';
import { SafetyOutlined, CheckCircleOutlined, ClockCircleOutlined, RocketOutlined, BulbOutlined, FileProtectOutlined, StarFilled, CrownOutlined } from '@ant-design/icons';
import { InsurancePlan } from '../../../types';
import { PLAN_MESSAGES, ACTIVATION_STEPS, PLAN_HIGHLIGHTS, PROGRESS_CONFIG } from './constants';
import './PlanDetails.css';

const { Title, Text, Paragraph } = Typography;

interface PlanDetailsProps {
  plan: InsurancePlan | null;
  dashboardData?: any;
  loading?: boolean;
}

const PlanDetails: React.FC<PlanDetailsProps> = ({ plan, dashboardData, loading = false }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Get selected plan from applications when plan is pending activation
  const getSelectedPlan = (): InsurancePlan | null => {
    // First, check if there's a currentPlan from dashboard
    if (dashboardData?.currentPlan) {
      return dashboardData.currentPlan;
    }

    // If no currentPlan, look for it in applications
    if (!dashboardData?.applications || dashboardData.applications.length === 0) {
      return null;
    }

    // Get the most recent application
    const sortedApps = [...dashboardData.applications].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latestApp = sortedApps[0];

    // Check if insurancePlan is populated in the application
    if (latestApp?.insurancePlan) {
      return latestApp.insurancePlan;
    }

    // Backend populates insurancePlanId with full object (not just ID)
    if (latestApp?.insurancePlanId && typeof latestApp.insurancePlanId === 'object') {
      return latestApp.insurancePlanId as InsurancePlan;
    }

    return null;
  };

  const selectedPlan = getSelectedPlan();

  const showPlanModal = () => setIsModalVisible(true);
  const handleModalClose = () => setIsModalVisible(false);

  if (!plan) {
    return (
      <>
        <Card className="plan-details-card pending-activation-card" loading={loading}>
          <div className="pending-activation-header">
            <div className="pulse-icon-wrapper">
              <RocketOutlined className="pending-icon" />
            </div>
            <Tag color="processing" className="status-tag">
              <ClockCircleOutlined /> Activation Pending
            </Tag>
          </div>

          <div className="pending-content">
            <div className="pending-title-wrapper">
              <FileProtectOutlined className="title-icon" />
              <Title level={3} className="pending-title">
                {PLAN_MESSAGES.PENDING_TITLE}
              </Title>
            </div>
            
            <Paragraph className="pending-message">
              {PLAN_MESSAGES.PENDING_MESSAGE}
            </Paragraph>

            <div className="activation-steps">
              <div className="step-item completed">
                <CheckCircleOutlined className="step-icon" />
                <div className="step-content">
                  <Text strong>{ACTIVATION_STEPS.PLAN_SELECTED.title}</Text>
                  <Text type="secondary">{ACTIVATION_STEPS.PLAN_SELECTED.description}</Text>
                </div>
              </div>

              <div className="step-item completed">
                <CheckCircleOutlined className="step-icon" />
                <div className="step-content">
                  <Text strong>{ACTIVATION_STEPS.DETAILS_VERIFIED.title}</Text>
                  <Text type="secondary">{ACTIVATION_STEPS.DETAILS_VERIFIED.description}</Text>
                </div>
              </div>

              <div className="step-item pending">
                <ClockCircleOutlined className="step-icon" />
                <div className="step-content">
                  <Text strong>{ACTIVATION_STEPS.PAYMENT_PENDING.title}</Text>
                  <Text type="secondary">{ACTIVATION_STEPS.PAYMENT_PENDING.description}</Text>
                </div>
              </div>
            </div>

            <div className="progress-section">
              <Text className="progress-label">{PLAN_MESSAGES.ACTIVATION_PROGRESS_LABEL}</Text>
              <Progress 
                percent={PROGRESS_CONFIG.PERCENT} 
                strokeColor={PROGRESS_CONFIG.STROKE_COLOR}
                status={PROGRESS_CONFIG.STATUS}
              />
            </div>

            <div className="pending-info-box">
              <BulbOutlined className="info-icon" />
              <div className="info-content">
                <Text strong>{PLAN_MESSAGES.INFO_TITLE}</Text>
                <Paragraph className="info-text">
                  {PLAN_MESSAGES.INFO_MESSAGE}
                </Paragraph>
              </div>
            </div>

            <div className="pending-actions">
              <Button type="primary" size="large" className="action-button" onClick={showPlanModal}>
                View Plan Details
              </Button>
            </div>
          </div>
        </Card>

        {/* Plan Details Modal */}
        <Modal
          title={null}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={600}
          className="plan-details-modal"
        >
          {selectedPlan ? (
            <>
              <div className="modal-header">
                <div className="modal-icon-wrapper">
                  <CrownOutlined className="modal-icon" />
                </div>
                <Title level={2} className="modal-title">{selectedPlan.name}</Title>
                <Tag color="orange" className="modal-badge">
                  <StarFilled /> {selectedPlan.category === 'premium' ? 'POPULAR CHOICE' : 'SELECTED PLAN'}
                </Tag>
              </div>

              <Divider />

              <div className="modal-pricing">
                <div className="pricing-main">
                  <Text className="price-label">Monthly Premium</Text>
                  <div className="price-display">
                    <span className="price-currency">{selectedPlan.currency}</span>
                    <span className="price-value">{selectedPlan.price}</span>
                    <span className="price-period">/{selectedPlan.billingCycle}</span>
                  </div>
                  <Text className="price-subtitle">Billed {selectedPlan.billingCycle}ly • Cancel anytime</Text>
                </div>
              </div>

              <Divider>Coverage Details</Divider>

              <div className="modal-features">
                <Row gutter={[16, 16]}>
                  {selectedPlan.features.map((feature, index) => (
                <Col span={12} key={index}>
                  <div className="modal-feature-item">
                    <CheckCircleOutlined className="modal-feature-icon" />
                    <Text>{feature}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          <Divider />

          <div className="modal-highlights">
            <Title level={5}>Why This Plan?</Title>
            <div className="highlight-grid">
              <div className="highlight-card">
                <SafetyOutlined className="highlight-icon" />
                <Text strong>{PLAN_HIGHLIGHTS.COMPREHENSIVE.title}</Text>
                <Text type="secondary">{PLAN_HIGHLIGHTS.COMPREHENSIVE.description}</Text>
              </div>
              <div className="highlight-card">
                <CheckCircleOutlined className="highlight-icon" />
                <Text strong>{PLAN_HIGHLIGHTS.INSTANT.title}</Text>
                <Text type="secondary">{PLAN_HIGHLIGHTS.INSTANT.description}</Text>
              </div>
              <div className="highlight-card">
                <StarFilled className="highlight-icon" />
                <Text strong>{PLAN_HIGHLIGHTS.SUPPORT.title}</Text>
                <Text type="secondary">{PLAN_HIGHLIGHTS.SUPPORT.description}</Text>
              </div>
            </div>
          </div>

          <div className="modal-footer-actions">
            <Button type="primary" size="large" onClick={handleModalClose} block>
              Close
            </Button>
          </div>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Text type="secondary">Plan information not available</Text>
            </div>
          )}
        </Modal>
      </>
    );
  }

  // Active plan view (when plan exists)
  return (
    <Card className="plan-details-card" loading={loading}>
      <div className="plan-header">
        <div className="plan-title-section">
          <SafetyOutlined className="plan-icon" />
          <div>
            <Title level={3} className="plan-name">{plan.name}</Title>
          </div>
        </div>
        <div className="plan-price">
          <Text className="price-amount">{plan.currency} {plan.price}</Text>
          <Text className="price-period">/{plan.billingCycle}</Text>
        </div>
      </div>

      <div className="plan-features">
        <Title level={5}>Plan Features</Title>
        <div className="features-grid">
          {plan.features.map((feature: string, index: number) => (
            <div key={index} className="feature-item">
              <CheckCircleOutlined className="feature-icon" />
              <Text>{feature}</Text>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PlanDetails;
