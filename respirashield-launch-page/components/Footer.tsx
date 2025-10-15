'use client'

import { Shield, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold text-white">RespiraShield</span>
            </div>
            <p className="text-sm text-gray-400 text-center md:text-left">
              Specialized insurance for vape users
            </p>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4" />
            <a 
              href="mailto:support@respirashield.com" 
              className="hover:text-primary transition-colors"
              aria-label="Email support at support@respirashield.com"
            >
              support@respirashield.com
            </a>
          </div>

          {/* CTA Link */}
          <a
            href="https://app.respirashield.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Register interest (opens in new tab)"
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full font-semibold text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-primary/50"
          >
            Register Interest
          </a>
        </div>

        {/* Legal & Disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500 mb-2">
            &copy; 2025 RespiraShield Insurance. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 max-w-3xl mx-auto">
            This is a market research initiative to gauge interest in specialized insurance solutions. 
            We&apos;re gathering feedback to understand demand—no certifications, approvals, or insurance products are currently offered. 
            Your data is secure and used solely for research validation.
          </p>
        </div>
      </div>
    </footer>
  )
}
