'use client'

import { motion } from 'framer-motion'
import { Shield, ArrowRight, ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Logo Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-gray-700">Gauging Market Interest</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Specialized Health Coverage
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white">
              for Vape Users
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Comprehensive insurance designed specifically for your lifestyle. 
            Protect your health, devices, and peace of mind with plans starting at just ₹149/month.
          </motion.p>

          {/* Supporting Copy */}
          <motion.p 
            className="text-base sm:text-lg text-purple-200 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            We&apos;re conducting market research to understand demand for specialized vape user insurance. 
            Register your interest to help bring this coverage to life.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <a 
              href="https://app.respirashield.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
            >
              Register Your Interest
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#coverage"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-primary transition-all duration-300"
            >
              Learn More
            </a>
          </motion.div>

          {/* Trust Badges */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-8 pt-12 text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">No Commitment Required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Early Access Benefits</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Be Heard</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <a href="#coverage" className="text-white/60 hover:text-white transition-colors">
            <ChevronDown className="w-8 h-8" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
