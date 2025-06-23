

import React from 'react';
import { useParams, Link } from 'react-router-dom';

// Mock case data
const cases = {
  ENQ001: {
    id: 'ENQ001',
    patientName: 'Ramesh Patel',
    ayushmanCard: 'AY1234567890',
    medicalCondition: 'Severe cardiac arrest',
    hospital: 'AIIMS Bhopal',
    contactName: 'Suresh Patel',
    contactPhone: '9876543210',
    cmoRemarks: 'Urgent transfer required',
    documents: ['ayushman_card.pdf', 'medical_report.pdf'],
  },
  ENQ002: {
    id: 'ENQ002',
    patientName: 'Sita Devi',
    ayushmanCard: 'AY0987654321',
    medicalCondition: 'Trauma from accident',
    hospital: 'CHL Indore',
    contactName: 'Ram Kumar',
    contactPhone: '9876543220',
    cmoRemarks: 'Stable but needs specialized care',
    documents: ['ayushman_card.pdf'],
  },
};

const EnquiryDetailsPage = () => {
  const { enquiryId } = useParams();
  const caseData = cases[enquiryId] || {};

  if (!caseData.id) {
    return <div className="max-w-4xl mx-auto p-6">Enquiry not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Enquiry Details - {enquiryId}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p><strong>Patient Name:</strong> {caseData.patientName}</p>
          <p><strong>Ayushman Card:</strong> {caseData.ayushmanCard}</p>
          <p><strong>Medical Condition:</strong> {caseData.medicalCondition}</p>
          <p><strong>Hospital:</strong> {caseData.hospital}</p>
        </div>
        <div>
          <p><strong>Contact Name:</strong> {caseData.contactName}</p>
          <p><strong>Contact Phone:</strong> {caseData.contactPhone}</p>
          <p><strong>CMO Remarks:</strong> {caseData.cmoRemarks}</p>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Documents</h3>
        <ul className="list-disc pl-5">
          {caseData.documents.map((doc, index) => (
            <li key={index}>{doc}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          to={`/sdm/validation/${enquiryId}`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Validate
        </Link>
        <Link
          to={`/sdm/approve-reject/${enquiryId}`}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Approve/Reject
        </Link>
        <Link
          to={`/sdm/query-to-cmo/${enquiryId}`}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Query CMO
        </Link>
        <Link
          to={`/sdm/forward-to-dm/${enquiryId}`}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Forward to DM
        </Link>
      </div>
    </div>
  );
};

export default EnquiryDetailsPage;