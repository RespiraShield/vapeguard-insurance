'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Basic Plan',
    price: '149',
    description: 'Essential coverage for basic protection',
    features: [
      'Basic health coverage',
      'Emergency support',
      'Online claim processing',
    ],
    popular: false,
  },
  {
    name: 'Premium Plan',
    price: '299',
    description: 'Comprehensive coverage with additional benefits',
    features: [
      'Comprehensive health coverage',
      'Priority emergency support',
      'Fast-track claim processing',
      'Wellness benefits',
    ],
    popular: true,
  },
  {
    name: 'Complete Plan',
    price: '499',
    description: 'Ultimate protection with premium features',
    features: [
      'Complete health coverage',
      '24/7 premium support',
      'Instant claim processing',
      'Wellness and fitness benefits',
      'Family coverage options',
    ],
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Proposed Coverage Plans
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These are our proposed pricing tiers based on market research. Final pricing will be confirmed once we launch.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-3xl p-8 shadow-lg ${
                plan.popular ? 'ring-2 ring-primary scale-105 shadow-2xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-block px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold gradient-text">₹{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Monthly billing</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://app.respirashield.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-4 rounded-xl font-semibold text-center transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-primary text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Register Interest
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
