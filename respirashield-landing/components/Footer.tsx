'use client'

import { Shield, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-white">RespiraShield</span>
            </div>
            <p className="text-sm leading-relaxed">
              Specialized health insurance for vape users. Protecting your health, devices, and peace of mind.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#coverage" className="hover:text-primary transition-colors">Coverage</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="https://app.respirashield.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Register Interest</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#benefits" className="hover:text-primary transition-colors">Why Choose Us</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <a href="mailto:support@respirashield.com" className="hover:text-primary transition-colors">
                  support@respirashield.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <a href="tel:+918055501234" className="hover:text-primary transition-colors">
                  +91 80 5550 1234
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Bengaluru, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; 2025 RespiraShield Insurance. All rights reserved.</p>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            This is a market research initiative. We&apos;re gathering interest to assess demand for specialized insurance solutions.
          </p>
        </div>
      </div>
    </footer>
  )
}
