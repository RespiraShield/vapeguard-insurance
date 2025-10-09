import React from 'react';
import { CheckCircleOutlined, BulbOutlined } from '@ant-design/icons';
import { SUCCESS_STEP } from '../../constants/texts';
import styles from './SuccessStep.module.css';

const SuccessStep = ({ applicationNumber = 'N/A' }) => {
  return (
    <div className={styles.successContainer}>
      <div className={styles.stepCard}>
        <div className={styles.celebrationHeader}>
          <CheckCircleOutlined className={styles.successIcon} />
          <h1 className={styles.successTitle}>{SUCCESS_STEP.TITLE}</h1>
          <p className={styles.successSubtitle}>{SUCCESS_STEP.SUBTITLE}</p>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.detailCard}>
            <div className={styles.cardLayout}>
              <div className={styles.cardLeft}>
                <div className={styles.cardDetails}>
                  <div className={styles.cardLabel}>Application Number</div>
                  <div className={styles.cardValue}>{applicationNumber}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.detailCard}>
            <div className={styles.cardLayout}>
              <div className={styles.cardLeft}>
                <div className={styles.cardDetails}>
                  <div className={styles.cardLabel}>Status</div>
                  <div className={styles.statusBadge}>Under Review</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.nextStepsSection}>
          <div className={styles.nextStepsTitle}>
            <BulbOutlined className={styles.nextStepsIcon} />
            {SUCCESS_STEP.NEXT_STEPS_TITLE}
          </div>
          <div className={styles.nextStepsList}>
            {(SUCCESS_STEP.NEXT_STEPS || []).map((step, index) => (
              <div key={index} className={styles.nextStepItem}>
                <CheckCircleOutlined className={styles.nextStepIcon} />
                <span className={styles.nextStepText}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.celebrationFooter}>
          🎉 Welcome to RespiraShield Insurance! Your journey to better health starts now. 🎉
        </div>

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
    </div>
  );
};

export default SuccessStep;
