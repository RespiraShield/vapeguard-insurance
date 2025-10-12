'use client'

import { motion } from 'framer-motion'
import { Clock, FileCheck, Smartphone, Headphones, TrendingUp, Lock } from 'lucide-react'

const benefits = [
  {
    icon: Clock,
    title: 'Quick Registration',
    description: 'Register your interest in minutes with a simple, straightforward form.',
  },
  {
    icon: FileCheck,
    title: 'Priority Access',
    description: 'Early registrants get first access to policies and exclusive launch benefits.',
  },
  {
    icon: Smartphone,
    title: 'Access Anywhere',
    description: 'Manage your policy and track claims from your phone, tablet, or computer.',
  },
  {
    icon: Headphones,
    title: 'Your Voice Matters',
    description: 'Help shape coverage options by sharing what matters most to you.',
  },
  {
    icon: TrendingUp,
    title: 'Planned Wellness Benefits',
    description: 'Proposed rewards program for healthy habits and lifestyle improvements.',
  },
  {
    icon: Lock,
    title: 'Data Privacy',
    description: 'Your information is secure and only used for market research validation.',
  },
]

export default function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Why Register Your Interest
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Be part of something new. Your early support helps us build specialized coverage that truly serves vape users.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-8 rounded-2xl border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <benefit.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
