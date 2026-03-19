import React from 'react';
import { PhoneCall } from 'lucide-react';

const EmergencyContactFloat = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="tel:18002332004"
        className="flex items-center justify-center gap-2 bg-red-600 text-white px-1 py-1 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 group"
        aria-label="Call Emergency Contact"
      >
        <div className="bg-white/20 p-2 rounded-full group-hover:animate-pulse">
          <PhoneCall size={16} className="text-white" />
        </div>
        <span className=" text-sm pr-1">1800 233 2004</span>
      </a>
    </div>
  );
};

export default EmergencyContactFloat;
