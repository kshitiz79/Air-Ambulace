import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{t.citizenHomeTitle || 'Welcome to Air Ambulance Services'}</h2>
      <p className="mb-4">{t.citizenHomeDesc || 'This portal facilitates air ambulance services under the Ayushman Bharat scheme in Madhya Pradesh, providing critical medical transport for emergencies.'}</p>
      
      <h3 className="text-lg font-medium mb-2">{t.eligibilityCriteria || 'Eligibility Criteria'}</h3>
      <ul className="list-disc ml-6 mb-4">
        <li>{t.eligibility1 || 'Resident of Madhya Pradesh'}</li>
        <li>{t.eligibility2 || 'Valid Ayushman Bharat card holder'}</li>
        <li>{t.eligibility3 || 'Medical emergency requiring air ambulance transfer'}</li>
      </ul>
      
      <h3 className="text-lg font-medium mb-2">{t.howToApply || 'How to Apply'}</h3>
      <p className="mb-4">{t.howToApplyDesc || 'Submit an enquiry with patient details and medical justification. Track your request using the Enquiry ID provided after submission.'}</p>
      
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        <Link to="/login">{t.getStarted || 'Get Started'}</Link>
      </button>
    </div>
  );
};