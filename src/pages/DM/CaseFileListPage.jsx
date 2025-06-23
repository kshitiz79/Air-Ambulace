// CaseFileListPage.jsx
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

const CaseFileListPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Case Files</h2>
      <div className="grid gap-4">
        {Object.values(cases).map((caseData) => (
          <div key={caseData.id} className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">{caseData.patientName}</h3>
            <p><strong>Condition:</strong> {caseData.medicalCondition}</p>
            <p><strong>Hospital:</strong> {caseData.hospital}</p>
            <Link
              to={`/dm-dashboard/case-file/${caseData.id}`}
              className="text-blue-600 underline mt-2 inline-block"
            >
              View Full Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseFileListPage;
