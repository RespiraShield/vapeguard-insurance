'use client'

import { motion } from 'framer-motion'
import { Shield, Heart, Building2, Users } from 'lucide-react'

const coverageItems = [
  {
    icon: Heart,
    title: 'Health Monitoring',
    description: 'Regular respiratory health check-ups, lung function tests, and personalized wellness tracking.',
  },
  {
    icon: Shield,
    title: 'Device Protection',
    description: 'Coverage for accidental damage, theft, and malfunction of your vaping devices up to ₹25,000.',
  },
  {
    icon: Building2,
    title: 'Liability Coverage',
    description: 'Protection against third-party claims and legal expenses up to ₹5 lakhs.',
  },
  {
    icon: Users,
    title: 'Family Benefits',
    description: 'Extend coverage to immediate family members with discounted premium rates.',
  },
]

export default function Coverage() {
  return (
    <section id="coverage" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Proposed Coverage Areas
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Here&apos;s what we&apos;re planning to offer. Help us refine these benefits by registering your interest.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {coverageItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
