import React,{ useState } from 'react';
import { Link } from 'react-router-dom';

const SearchPage = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    enquiryId: '',
    patientName: '',
    status: 'ALL',
  });
  const [searchResults, setSearchResults] = useState([]);

  // Mock case data
  const cases = [
    {
      id: 'ENQ001',
      patientName: 'Ramesh Patel',
      status: 'PENDING',
      hospital: 'AIIMS Bhopal',
      date: '2025-06-01',
    },
    {
      id: 'ENQ002',
      patientName: 'Sita Devi',
      status: 'FORWARDED',
      hospital: 'CHL Indore',
      date: '2025-06-02',
    },
  ];

  const handleChange = (e) => {
    setSearchCriteria({ ...searchCriteria, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate search
    const results = cases.filter((c) => {
      return (
        (searchCriteria.enquiryId === '' || c.id.toLowerCase().includes(searchCriteria.enquiryId.toLowerCase())) &&
        (searchCriteria.patientName === '' || c.patientName.toLowerCase().includes(searchCriteria.patientName.toLowerCase())) &&
        (searchCriteria.status === 'ALL' || c.status === searchCriteria.status)
      );
    });
    setSearchResults(results);
  };

  return (
    <div className="mx-auto bg-white max-w-6xl p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Search Cases</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium">Enquiry ID</label>
            <input
              type="text"
              name="enquiryId"
              value={searchCriteria.enquiryId}
              onChange={handleChange}
              placeholder="Enter Enquiry ID"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium">Patient Name</label>
            <input
              type="text"
              name="patientName"
              value={searchCriteria.patientName}
              onChange={handleChange}
              placeholder="Enter patient name"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={searchCriteria.status}
              onChange={handleChange}
              class="w-full p-2 border rounded"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="FORWARDED">Forwarded</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          class="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
        >
          Search
        </button>
      </form>
      {searchResults.length > 0 ? (
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-200">
              <th class="border p-2">Enquiry ID</th>
              <th class="border p-2">Patient</th>
              <th class="border p-2">Status</th>
              <th class="border p-2">Hospital</th>
              <th class="border p-2">Date</th>
              <th class="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((c) => (
              <tr key={c.id}>
                <td class="border p-2">{c.id}</td>
                <td class="border p-2">{c.patientName}</td>
                <td class="border p-2">{c.status}</td>
                <td class="border p-2">{c.hospital}</td>
                <td class="border p-2">{c.date}</td>
                <td class="border p-2">
                  <Link
                    to={`/sdm/enquiry-details/${c.id}`}
                    class="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p class="text-gray-600">No results found.</p>
      )}
    </div>
  );
};

export default SearchPage;