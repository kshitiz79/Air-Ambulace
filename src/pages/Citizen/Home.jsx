

import React from 'react';
import { Link } from 'react-router-dom';
export default function Home() {
      return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome to Air Ambulance Services</h2>
          <p className="mb-4">This portal facilitates air ambulance services under the Ayushman Bharat scheme in Madhya Pradesh, providing critical medical transport for emergencies.</p>
          <h3 className="text-lg font-medium mb-2">Eligibility Criteria</h3>
          <ul className="list-disc ml-6 mb-4">
            <li>Resident of Madhya Pradesh</li>
            <li>Valid Ayushman Bharat card holder</li>
            <li>Medical emergency requiring air ambulance transfer</li>
          </ul>
          <h3 className="text-lg font-medium mb-2">How to Apply</h3>
          <p className="mb-4">Submit an enquiry with patient details and medical justification. Track your request using the Enquiry ID provided after submission.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Link to="/login">Get Started</Link>
          </button>
        </div>
      );
    };