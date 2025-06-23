import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import React from 'react';
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
    sdmRemarks: 'Validated for emergency',
    dmRemarks: 'Approved with funding',
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
    sdmRemarks: 'Forwarded after validation',
    dmRemarks: 'Approved',
    documents: ['ayushman_card.pdf'],
  },
};

const CaseDetailsPage = () => {
  const { enquiryId } = useParams();
  const caseData = cases[enquiryId] || {};

  if (!caseData.id) {
    return <div className="max-w-4xl mx-auto p-6">Enquiry nt found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Case Details - {enquiryId}</h2>
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
          <p><strong>SDM Remarks:</strong> {caseData.sdmRemarks}</p>
          <p><strong>DM Remarks:</strong> {caseData.dmRemarks}</p>
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
          to={`/air/ambulance-assignment/${enquiryId}`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Assign Ambulance
        </Link>
        <Link
          to={`/air/tracker/${enquiryId}`}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Track
        </Link>
        <Link
          to={`/air/post-operation-report/${enquiryId}`}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Post-Operation Report
        </Link>
        <Link
          to={`/air/invoice-generation/${enquiryId}`}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Generate Invoice
        </Link>
        <Link
          to={`/air/case-closure/${enquiryId}`}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Close Case
        </Link>
      </div>
    </div>
  );
};

export default CaseDetailsPage;
