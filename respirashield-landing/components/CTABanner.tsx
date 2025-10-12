'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield } from 'lucide-react'

export default function CTABanner() {
  return (
    <section className="py-24 bg-gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Shield className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">Early Registrants Only</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Help Shape the Future of Vape Insurance
          </h2>

          <p className="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto">
            Your voice matters. Register your interest and be first in line when we launch.
            Early registrants receive exclusive benefits and priority enrollment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a
              href="https://app.respirashield.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-primary rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
            >
              Register Your Interest
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <p className="text-sm text-purple-200">
            No payment required • No commitment • Join the waitlist today
          </p>
        </motion.div>
      </div>
    </section>
  )
}
