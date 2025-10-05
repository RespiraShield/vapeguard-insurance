import React from 'react';
import './EnrollmentStep.css';

const EnrollmentStep = ({ 
  selectedInsurance, 
  insurancePlans, 
  onEnrollNow, 
  loading 
}) => {
  const selectedPlan = insurancePlans.find(plan => plan._id === selectedInsurance);

  if (!selectedPlan) {
    return (
      <div className="enrollment-step">
        <div className="error-message">
          Please select an insurance plan first.
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-step">
      <div className="enrollment-header">
        <h2>Enroll Now, Pay Later</h2>
        <p className="enrollment-subtitle">
          Complete your enrollment today and pay when convenient for you
        </p>
      </div>

      <div className="enrollment-card">
        <div className="plan-summary">
          <h3>{selectedPlan.name}</h3>
          <div className="plan-price">{selectedPlan.price}</div>
        </div>

        <div className="enrollment-benefits">
          <h4>What you get with enrollment:</h4>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Immediate coverage activation</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Payment details via email when available</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Access to all plan benefits</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Flexible payment options</span>
            </div>
          </div>
        </div>

        <div className="plan-features">
          <h4>Plan Features:</h4>
          <ul className="features-list">
            {selectedPlan.features.map((feature, index) => (
              <li key={index} className="feature-item">
                <span className="feature-bullet">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="enrollment-notice">
          <div className="notice-box">
            <h4>Important Notice</h4>
            <p>
              By enrolling now, you secure your coverage immediately. We are currently 
              in enrollment phase and payment information will be provided via email 
              when payment collection begins. Your coverage remains active during this period.
            </p>
          </div>
        </div>

        <div className="enrollment-actions">
          <button 
            className="enroll-button"
            onClick={onEnrollNow}
            disabled={loading}
          >
            {loading ? 'Processing Enrollment...' : 'Enroll Now & Pay Later'}
          </button>
          
          <div className="enrollment-terms">
            <p>
              By clicking "Enroll Now", you agree to our terms and conditions. 
              Payment details will be shared via email when payment collection begins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentStep;
