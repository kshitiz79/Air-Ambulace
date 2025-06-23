import { Link } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
// Mock case data
const cases = [
  {
    id: 'ENQ001',
    patientName: 'Ramesh Patel',
    status: 'ASSIGNED',
    hospital: 'AIIMS Bhopal',
    date: '2025-06-01',
  },
  {
    id: 'ENQ002',
    patientName: 'Sita Devi',
    status: 'IN_TRANSIT',
    hospital: 'CHL Indore',
    date: '2025-06-02',
  },
];

const CaseListPage = () => {
  const [filter, setFilter] = useState({ status: 'ALL', date: '' });

  const filteredCases = cases.filter((c) => {
    return (
      (filter.status === 'ALL' || c.status === filter.status) &&
      (!filter.date || c.date.includes(filter.date))
    );
  });

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Case List</h2>
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={filter.status}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="ALL">All</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={filter.date}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((caseItem) => (
          <Link
            to={`/air-team/case-details/${caseItem.id}`}
            key={caseItem.id}
            className="block bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-blue-600">{caseItem.id}</h3>
            <p className="mt-2"><strong>Patient:</strong> {caseItem.patientName}</p>
            <p><strong>Status:</strong> {caseItem.status}</p>
            <p><strong>Hospital:</strong> {caseItem.hospital}</p>
            <p><strong>Date:</strong> {caseItem.date}</p>
            <p className="mt-4 text-sm text-blue-600 hover:underline">View Details</p>
          </Link>
        ))}
      </div>
      {filteredCases.length === 0 && (
        <p className="text-gray-600 text-center mt-6">No cases found.</p>
      )}
    </div>
  );
};

export default CaseListPage;