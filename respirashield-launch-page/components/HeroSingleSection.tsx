'use client'

import { motion } from 'framer-motion'
import { Shield, Activity, Heart, Zap, Users, ArrowRight, Check } from 'lucide-react'

export default function HeroSingleSection() {
  return (
    <section 
      aria-label="Hero section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero"
    >
      {/* Background Pattern - Subtle dot grid */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Floating gradient orbs for glassmorphism depth */}
      <div 
        className="absolute top-20 left-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '0s' }}
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '1s' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center">
        
        {/* Badge - Market validation context */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect"
        >
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-gray-700">Market Research Initiative</span>
        </motion.div>

        {/* Headline - Bold, gradient, punchy */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight"
        >
          Insurance That Actually
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white">
            Gets You
          </span>
        </motion.h1>

        {/* Subhead - One-liner value prop */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-4 text-xl sm:text-2xl text-purple-100 max-w-2xl mx-auto font-medium"
        >
          Specialized health coverage + treatment support for vape users. Zero commitment, just your interest.
        </motion.p>

        {/* Value bullets - Icon + text, responsive layout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-white/90"
        >
          {[
            { icon: Heart, text: 'Respiratory Health Focus' },
            { icon: Activity, text: 'Treatment Coverage' },
            { icon: Zap, text: 'Wellness Perks' },
            { icon: Users, text: 'Community-Driven' },
          ].map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm"
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA - Primary button */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10"
        >
          <a
            href="https://app.respirashield.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Register your interest in RespiraShield insurance (opens in new tab)"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/50"
          >
            Register Your Interest
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </a>
        </motion.div>

        {/* Trust cues - Below CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-6 flex flex-wrap justify-center gap-4 sm:gap-6 text-purple-200 text-sm"
        >
          {[
            'No Payment Required',
            'Your Data Stays Private',
            'Just Gauging Demand',
          ].map((text, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
              className="flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof / momentum cue */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8 text-sm text-purple-300 font-medium"
        >
          Join early supporters shaping the launch • No approvals or certifications implied
        </motion.p>
      </div>
    </section>
  )
}
