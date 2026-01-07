import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '919319208927'; // WhatsApp number with country code
  
  const predefinedMessages = [
    {
      id: 1,
      text: "I need emergency air ambulance service",
      message: "Hello, I need emergency air ambulance service. Please assist me immediately."
    },
    {
      id: 2,
      text: "Check eligibility for free service",
      message: "Hello, I would like to check my eligibility for the free air ambulance service under Ayushman scheme."
    },
    {
      id: 3,
      text: "Get service information",
      message: "Hello, I would like to know more about the PM Shri Air Ambulance service."
    },
    {
      id: 4,
      text: "Speak to support team",
      message: "Hello, I need to speak with your support team regarding air ambulance service."
    }
  ];

  const handleWhatsAppClick = (message) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const handleDirectChat = () => {
    const defaultMessage = "Hello, I need assistance with the PM Shri Air Ambulance service.";
    handleWhatsAppClick(defaultMessage);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        {isOpen && (
          <div className="mb-4 bg-white rounded-2xl shadow-2xl w-80 sm:w-96 animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-full p-2">
                  <MessageCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Air Ambulance Support</h3>
                  <p className="text-xs text-green-100">We're here to help 24/7</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-green-800 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  👋 Welcome! How can we assist you today?
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="space-y-2">
                {predefinedMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleWhatsAppClick(msg.message)}
                    className="w-full text-left bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg p-3 transition-all duration-200 text-sm text-gray-700 hover:text-green-700 shadow-sm hover:shadow-md"
                  >
                    <span className="flex items-center">
                      <MessageCircle size={16} className="mr-2 text-green-600" />
                      {msg.text}
                    </span>
                  </button>
                ))}
              </div>

              {/* Direct Chat Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleDirectChat}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <MessageCircle size={18} className="mr-2" />
                  Start WhatsApp Chat
                </button>
              </div>

              {/* Contact Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Or call us directly at
                </p>
                <a
                  href="tel:+919319208927"
                  className="text-sm font-semibold text-green-600 hover:text-green-700"
                >
                  +91 9319208927
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Button Container with relative positioning */}
        <div className="relative">
          {/* Main Chat Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-10 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
            aria-label="Open WhatsApp Chat"
          >
            <div className="flex items-center justify-center">
              {isOpen ? (
                <X size={28} className="animate-spin-slow" />
              ) : (
                <MessageCircle size={28} className="group-hover:animate-bounce" />
              )}
            </div>
          </button>

          {/* Pulse Animation Ring */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20 pointer-events-none"></div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(180deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default WhatsAppChatbot;
