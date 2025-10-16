const Application = require('../models/Application');

/**
 * 🛡️ Insurance Handlers
 * Clean separation of insurance logic from routes
 */

// Predefined insurance plans with smart tier categorization
const INSURANCE_PLANS = [
  {
    id: 1,
    name: 'Basic Respiratory Care',
    price: '₹149/purchase',
    category: 'basic',
    tier: 'Bronze',
    description: 'Essential respiratory care coverage for everyday protection',
    features: [
      'Lung function monitoring',
      'Basic respiratory health check',
      'X-ray coverage (1 per year)',
      'Telemedicine consultation',
      'Emergency respiratory support'
    ],
    coverage: '₹50,000',
    duration: '1 year',
    popular: false
  },
  {
    id: 2,
    name: 'Premium Respiratory Care',
    price: '₹299/purchase',
    category: 'premium',
    tier: 'Silver',
    description: 'Advanced respiratory care with specialist consultations',
    features: [
      'All Basic features',
      'Advanced lung imaging (CT scan)',
      'Pulmonary function tests',
      'Specialist consultations',
      'Respiratory therapy sessions',
      'Annual health checkup'
    ],
    coverage: '₹1,00,000',
    duration: '1 year',
    popular: true
  },
  {
    id: 3,
    name: 'Complete Health Guard',
    price: '₹499/purchase',
    category: 'complete',
    tier: 'Gold',
    description: 'Comprehensive health coverage with premium benefits',
    features: [
      'All Premium features',
      'Full body health screening',
      'Cardiovascular monitoring',
      'Mental health support',
      'Nutrition counseling',
      'Fitness tracking integration',
      '24/7 health helpline'
    ],
    coverage: '₹2,00,000',
    duration: '1 year',
    popular: false
  }
];

/**
 * Get all insurance plans
 */
const getAllPlans = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Insurance plans retrieved successfully',
      data: {
        plans: INSURANCE_PLANS,
        totalPlans: INSURANCE_PLANS.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific insurance plan by ID
 */
const getPlanById = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const planIdNum = parseInt(planId);

    if (isNaN(planIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan ID format'
      });
    }

    const plan = INSURANCE_PLANS.find(p => p.id === planIdNum);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Insurance plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Insurance plan retrieved successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get insurance statistics and analytics
 */
const getInsuranceStats = async (req, res, next) => {
  try {
    // Get application statistics
    const totalApplications = await Application.countDocuments();
    const completedApplications = await Application.countDocuments({ status: 'completed' });
    const pendingApplications = await Application.countDocuments({ status: { $in: ['draft', 'submitted'] } });

    // Get plan popularity statistics
    const planStats = await Application.aggregate([
      {
        $match: {
          'insuranceDetails.selectedPlan': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$insuranceDetails.selectedPlan',
          count: { $sum: 1 },
          planName: { $first: '$insuranceDetails.planName' },
          planPrice: { $first: '$insuranceDetails.planPrice' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate conversion rates
    const conversionRate = totalApplications > 0 ? 
      ((completedApplications / totalApplications) * 100).toFixed(2) : 0;

    // Get recent applications
    const recentApplications = await Application.find()
      .select('applicationNumber personalDetails.name insuranceDetails.planName status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate total revenue (from completed applications)
    const revenueData = await Application.aggregate([
      {
        $match: {
          status: 'completed',
          'insuranceDetails.planPrice': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $toInt: {
                $arrayElemAt: [
                  {
                    $split: [
                      {
                        $arrayElemAt: [
                          { $split: ['$insuranceDetails.planPrice', '₹'] },
                          1
                        ]
                      },
                      '/'
                    ]
                  },
                  0
                ]
              }
            }
          }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({
      success: true,
      message: 'Insurance statistics retrieved successfully',
      data: {
        overview: {
          totalApplications,
          completedApplications,
          pendingApplications,
          conversionRate: `${conversionRate}%`,
          totalRevenue: `₹${totalRevenue}`
        },
        planPopularity: planStats.map(stat => ({
          planId: stat._id,
          planName: stat.planName,
          planPrice: stat.planPrice,
          applicationsCount: stat.count,
          percentage: totalApplications > 0 ? 
            ((stat.count / totalApplications) * 100).toFixed(2) + '%' : '0%'
        })),
        availablePlans: INSURANCE_PLANS.map(plan => ({
          ...plan,
          applicationsCount: planStats.find(stat => stat._id === plan.id)?.count || 0
        })),
        recentApplications: recentApplications.map(app => ({
          applicationNumber: app.applicationNumber,
          customerName: app.personalDetails?.name || 'N/A',
          planName: app.insuranceDetails?.planName || 'Not selected',
          status: app.status,
          appliedDate: app.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get plan comparison data
 */
const getPlansComparison = async (req, res, next) => {
  try {
    const comparison = INSURANCE_PLANS.map(plan => {
      // Extract price number for comparison
      const priceMatch = plan.price.match(/₹(\d+)/);
      const priceValue = priceMatch ? parseInt(priceMatch[1]) : 0;
      
      // Extract coverage number for comparison
      const coverageMatch = plan.coverage.match(/₹([\d,]+)/);
      const coverageValue = coverageMatch ? 
        parseInt(coverageMatch[1].replace(/,/g, '')) : 0;

      return {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        priceValue,
        coverage: plan.coverage,
        coverageValue,
        duration: plan.duration,
        featuresCount: plan.features.length,
        features: plan.features,
        valueRatio: coverageValue / priceValue // Coverage per rupee spent
      };
    });

    // Sort by value ratio (best value first)
    const sortedByValue = [...comparison].sort((a, b) => b.valueRatio - a.valueRatio);

    res.json({
      success: true,
      message: 'Plan comparison data retrieved successfully',
      data: {
        plans: comparison,
        recommendations: {
          bestValue: sortedByValue[0],
          mostAffordable: comparison.reduce((min, plan) => 
            plan.priceValue < min.priceValue ? plan : min),
          highestCoverage: comparison.reduce((max, plan) => 
            plan.coverageValue > max.coverageValue ? plan : max),
          mostFeatures: comparison.reduce((max, plan) => 
            plan.featuresCount > max.featuresCount ? plan : max)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  getInsuranceStats,
  getPlansComparison
};
