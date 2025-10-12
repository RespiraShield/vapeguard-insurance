'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What makes RespiraShield different from regular health insurance?',
    answer: 'RespiraShield is designed specifically for vape users, addressing gaps in traditional coverage. We\'re proposing coverage for respiratory health, device protection, and wellness programs tailored to this lifestyle. Right now, we\'re validating if there\'s enough demand for such specialized insurance.',
  },
  {
    question: 'Are you accepting insurance applications right now?',
    answer: 'We\'re currently in the research phase, gathering data to understand if there\'s genuine demand for this type of specialized coverage. By registering your interest, you\'ll help us determine if we can move forward and you\'ll be first to know when policies become available.',
  },
  {
    question: 'Why should I register if coverage isn\'t active yet?',
    answer: 'Your registration helps us prove to insurance providers that there\'s real demand for this coverage. The more interest we gather, the faster we can launch with competitive pricing. Early registrants will also receive exclusive benefits and priority enrollment when we go live.',
  },
  {
    question: 'What will the pricing plans actually cover?',
    answer: 'The plans shown represent our proposed coverage structure based on market research. They\'re designed to include respiratory health monitoring, device protection against damage and theft, wellness programs, and emergency support. Final coverage details will be confirmed once we partner with licensed insurance providers.',
  },
  {
    question: 'When will RespiraShield actually launch?',
    answer: 'That depends on you and others in the community. We need to demonstrate sufficient demand to secure partnerships with insurance providers and regulatory approval. If we reach our validation goals, we aim to launch within 6-12 months. All early registrants will be notified first.',
  },
  {
    question: 'Is my registration information secure?',
    answer: 'Absolutely. We use industry-standard encryption and follow strict data protection practices. Your information is only used to assess market demand and will never be sold or shared with third parties. You can request deletion of your data at any time by contacting us.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about RespiraShield Insurance.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border-2 border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
