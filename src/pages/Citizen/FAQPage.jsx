

import React from 'react';

export default function FAQPage() {
  const faqs = [
    {
      question: 'Who is eligible for air ambulance services?',
      answer: 'Residents of Madhya Pradesh with a valid Ayushman Bharat card facing a medical emergency.'
    },
    {
      question: 'How do I track my enquiry?',
      answer: 'Use the Enquiry ID provided after submission on the Status Check page.'
    },
    {
      question: 'What documents are required?',
      answer: 'Ayushman card, medical reports, and ID proof (optional, may be handled by CMO).'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h3 className="text-lg font-medium">{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
