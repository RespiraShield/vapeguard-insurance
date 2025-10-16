import React, { useState } from 'react';
import { Alert, Typography, Spin } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  RightOutlined
} from '@ant-design/icons';
import { INSURANCE_SELECTION_STEP } from '../../constants/texts';
import TierBadge from '../TierBadges/TierBadges';
import styles from './InsuranceSelectionStep.module.css';

const { Title, Text } = Typography;

const InsuranceSelectionStep = ({ 
  selectedInsurance = null, 
  handleInsuranceSelect = () => {}, 
  handleSkipSelection = () => {},
  errors = {},
  insurancePlans = []
}) => {
  const [expandedPlan, setExpandedPlan] = useState(selectedInsurance);
  
  const loading = insurancePlans.length === 0;
  const error = null;

  const handlePlanClick = (planId) => {
    // Always select the plan first
    handleInsuranceSelect(planId);
    
    // Then handle expansion
    if (selectedInsurance === planId) {
      // If already selected, toggle expansion
      setExpandedPlan(expandedPlan === planId ? null : planId);
    } else {
      // Select new plan and expand it
      setExpandedPlan(planId);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Title level={2} className={styles.title}>{INSURANCE_SELECTION_STEP.TITLE}</Title>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Loading insurance plans...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Title level={2} className={styles.title}>{INSURANCE_SELECTION_STEP.TITLE}</Title>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ margin: '20px 0' }}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Title level={2} className={styles.title}>{INSURANCE_SELECTION_STEP.TITLE}</Title>
      <Text className={styles.subtitle}>{INSURANCE_SELECTION_STEP.SUBTITLE}</Text>
      <Text className={styles.optionalNote} style={{ display: 'block', marginTop: '8px', color: '#666', fontSize: '14px' }}>
        You can select a plan now or skip and choose later
      </Text>
      
      <div className={styles.plansContainer}>
        {(insurancePlans || []).map((plan) => (
          <div 
            key={plan._id}
            className={`${styles.planCard} ${selectedInsurance === plan._id ? styles.selectedCard : ''}`}
            onClick={() => handlePlanClick(plan._id)}
          >
            <div className={styles.planMain}>
              <div className={styles.planLeft}>
                <div className={styles.radioButton}>
                  {selectedInsurance === plan._id ? (
                    <div className={styles.radioSelected}>
                      <div className={styles.radioInner}></div>
                    </div>
                  ) : (
                    <div className={styles.radioUnselected}></div>
                  )}
                </div>
                <div className={styles.planInfo}>
                  <div className={styles.planNameRow}>
                    <span className={styles.planName}>{plan.name}</span>
                    {plan.popular && (
                      <span className={styles.popularTag}>POPULAR</span>
                    )}
                    <div className={styles.tierContainer}>
                      <div className={styles.tierBadgeWrapper}>
                        <TierBadge tier={plan.tier} size={90} />
                      </div>
                      <div className={styles.tierInfo}>
                        <span className={styles.tierBadge}>
                          {plan.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={styles.planDescription}>
                    {plan.description || 'Comprehensive insurance coverage'}
                  </span>
                </div>
              </div>
            </div>
            
            {selectedInsurance === plan._id && expandedPlan === plan._id && (
              <div className={styles.planDetails}>
                <div className={styles.featuresHeader}>Features included:</div>
                <ul className={styles.featuresList}>
                  {(plan.features || []).map((feature, index) => (
                    <li key={index} className={styles.featureItem}>
                      <CheckCircleOutlined className={styles.featureIcon} />
                      <span className={styles.featureText}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {errors.selectedInsurance && (
        <div className={styles.alertContainer}>
          <Alert
            message={errors.selectedInsurance}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      )}
      
      {/* Select Plan Later Option */}
      <div className={styles.skipOptionContainer}>
        <div className={styles.divider}>
          <span className={styles.dividerText}>OR</span>
        </div>
        
        <button 
          type="button"
          className={styles.skipButton}
          onClick={handleSkipSelection}
        >
          <div className={styles.skipButtonContent}>
            <ClockCircleOutlined className={styles.skipIcon} />
            <div className={styles.skipTextContainer}>
              <span className={styles.skipTitle}>Skip for Now</span>
              <span className={styles.skipSubtitle}>Continue and choose your plan later</span>
            </div>
            <RightOutlined className={styles.skipArrow} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default InsuranceSelectionStep;
