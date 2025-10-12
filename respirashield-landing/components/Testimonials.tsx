'use client'

import { motion } from 'framer-motion'
import { Rocket, Calendar, Users, TrendingUp } from 'lucide-react'

const upcomingFeatures = [
  {
    icon: Calendar,
    title: 'Application Tracking Dashboard',
    description: 'Real-time status updates and document management for your insurance applications.',
    timeline: 'Coming Soon!',
  },
  {
    icon: Users,
    title: 'Wellness Workshops',
    description: 'Expert-led sessions on respiratory health, fitness, and lifestyle optimization.',
    timeline: 'Launching Soon!',
  },
  {
    icon: TrendingUp,
    title: 'Early Adopter Program',
    description: 'Exclusive benefits and priority support for our founding members.',
    timeline: 'Enrollment open now',
  },
]

export default function EarlyAdopters() {
  return (
    <section className="py-24 bg-gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Rocket className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">Just Launched</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Be Among the First
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            We're just getting started, and we're building this with transparency at the core. Join us early and help shape the future of specialized health coverage.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {upcomingFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                {feature.timeline}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20">
            <p className="text-white font-medium mb-2">Your testimonial could be here next</p>
            <p className="text-purple-200 text-sm">
              Be part of our founding story and share your experience with RespiraShield
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-8 pt-12 mt-12 border-t border-white/20"
        >
          <div className="text-center text-white">
            <p className="text-2xl font-bold mb-1">100%</p>
            <p className="text-xs opacity-80">Transparent</p>
          </div>
          <div className="text-center text-white">
            <p className="text-2xl font-bold mb-1">0</p>
            <p className="text-xs opacity-80">Hidden Fees</p>
          </div>
          <div className="text-center text-white">
            <p className="text-2xl font-bold mb-1">Community</p>
            <p className="text-xs opacity-80">Driven</p>
          </div>
          <div className="text-center text-white">
            <p className="text-2xl font-bold mb-1">Secure</p>
            <p className="text-xs opacity-80">Data Handling</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
