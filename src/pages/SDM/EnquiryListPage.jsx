// EnquiryListPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const cases = {
  ENQ001: {
    id: 'ENQ001',
    patientName: 'Ramesh Patel',
    medicalCondition: 'Severe cardiac arrest',
    hospital: 'AIIMS Bhopal',
  },
  ENQ002: {
    id: 'ENQ002',
    patientName: 'Sita Devi',
    medicalCondition: 'Trauma from accident',
    hospital: 'CHL Indore',
  },
};

const EnquiryListPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Enquiry Cases</h2>
      <div className="grid gap-4">
        {Object.values(cases).map((enquiry) => (
          <div key={enquiry.id} className="p-4 border rounded shadow bg-white">
            <h3 className="text-lg font-semibold">{enquiry.patientName}</h3>
            <p><strong>Medical Condition:</strong> {enquiry.medicalCondition}</p>
            <p><strong>Hospital:</strong> {enquiry.hospital}</p>
            <Link
              to={`/sdm-dashboard/enquiry-detail-page/${enquiry.id}`}
              className="mt-2 inline-block text-blue-600 underline"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnquiryListPage;
