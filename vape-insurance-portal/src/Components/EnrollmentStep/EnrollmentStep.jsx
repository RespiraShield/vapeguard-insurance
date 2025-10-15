import React from 'react';
import './EnrollmentStep.css';

const EnrollmentStep = ({ 
  selectedInsurance, 
  insurancePlans, 
  onEnrollNow, 
  loading 
}) => {
  const selectedPlan = insurancePlans.find(plan => plan._id === selectedInsurance);

  // Allow enrollment without a plan - user can choose later
  return (
    <div className="enrollment-step">
      <div className="enrollment-header">
        <h2>Enroll Now, Pay Later</h2>
        <p className="enrollment-subtitle">
          {selectedPlan 
            ? 'Complete your enrollment today and pay when convenient for you'
            : 'Complete your enrollment and choose your plan later'
          }
        </p>
      </div>

      <div className="enrollment-card">
        {selectedPlan && (
          <div className="plan-summary">
            <h3>{selectedPlan.name}</h3>
            <div className="plan-price">₹{selectedPlan.price}</div>
          </div>
        )}
        
        {!selectedPlan && (
          <div className="plan-summary no-plan-selected">
            <h3>No Plan Selected Yet</h3>
            <p className="no-plan-message">
              You can select your insurance plan after completing enrollment
            </p>
          </div>
        )}

        <div className="enrollment-benefits">
          <h4>What you get with enrollment:</h4>
          <div className="benefits-grid">
            {selectedPlan ? (
              <>
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
              </>
            ) : (
              <>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Account created and verified</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Choose insurance plan anytime</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Access to plan comparisons</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Flexible payment options later</span>
                </div>
              </>
            )}
          </div>
        </div>

        {selectedPlan && (
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
        )}

        <div className="enrollment-notice">
          <div className="notice-box">
            <h4>Important Notice</h4>
            <p>
              {selectedPlan ? (
                <>
                  By enrolling now, you secure your coverage immediately. We are currently 
                  in enrollment phase and payment information will be provided via email 
                  when payment collection begins. Your coverage remains active during this period.
                </>
              ) : (
                <>
                  By enrolling now, you complete your registration. You can select your preferred 
                  insurance plan anytime after enrollment. Payment information will be provided 
                  via email when payment collection begins.
                </>
              )}
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
