

import   React,{ useState } from 'react';
import { Link } from 'react-router-dom';

const DMDashboard = () => {
  const [filter, setFilter] = useState({ status: 'ALL', date: '' });
  // Mock case data
  const cases = [
    {
      id: 'ENQ001',
      patientName: 'Ramesh Patel',
      status: 'PENDING',
      date: '2025-06-01',
      hospital: 'AIIMS Bhopal',
    },
    {
      id: 'ENQ002',
      patientName: 'Sita Devi',
      status: 'APPROVED',
      date: '2025-06-02',
      hospital: 'CHL Indore',
    },
    {
      id: 'ENQ003',
      patientName: 'Vikram Singh',
      status: 'REJECTED',
      date: '2025-06-03',
      hospital: 'GMC Gwalior',
    },
  ];

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
      <h2 className="text-xl font-semibold mb-4">DM Dashboard</h2>
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
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-medium">Pending Cases</h3>
          <p className="text-2xl">{cases.filter((c) => c.status === 'PENDING').length}</p>
        </div>
        <div className="p-4 bg-green-100 rounded">
          <h3 className="font-medium">Approved Cases</h3>
          <p className="text-2xl">{cases.filter((c) => c.status === 'APPROVED').length}</p>
        </div>
        <div className="p-4 bg-red-100 rounded">
          <h3 className="font-medium">Rejected Cases</h3>
          <p className="text-2xl">{cases.filter((c) => c.status === 'REJECTED').length}</p>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Enquiry ID</th>
            <th className="border p-2">Patient</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCases.map((c) => (
            <tr key={c.id}>
              <td className="border p-2">{c.id}</td>
              <td className="border p-2">{c.patientName}</td>
              <td className="border p-2">{c.status}</td>
              <td className="border p-2">{c.date}</td>
              <td className="border p-2">
                <Link
                  to={`/dm/case-file/${c.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DMDashboard;