import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';

const CreateDistrict = () => {
  const [formData, setFormData] = useState({
    district_name: '',
    post_office_name: '',
    pincode: '',
    state: 'Madhya Pradesh',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all districts on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/api/districts`);
        setDistricts(response.data);
      } catch (err) {
        setError('Failed to fetch districts');
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${baseUrl}/api/districts`, formData);
      setSuccess('District created successfully!');
      setFormData({
        district_name: '',
        post_office_name: '',
        pincode: '',
        state: 'Madhya Pradesh',
      });
      // Refresh district list
      const updatedDistricts = await axios.get(`${baseUrl}/api/districts`);
      setDistricts(updatedDistricts.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create district');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create New District</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="district_name" className="block text-sm font-medium text-gray-700">
              District Name
            </label>
            <input
              type="text"
              id="district_name"
              name="district_name"
              value={formData.district_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="post_office_name" className="block text-sm font-medium text-gray-700">
              Post Office Name
            </label>
            <input
              type="text"
              id="post_office_name"
              name="post_office_name"
              value={formData.post_office_name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
              Pincode
            </label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Create District
          </button>
        </form>
      </div>

      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">District List</h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading districts...</p>
        ) : districts.length === 0 ? (
          <p className="text-center text-gray-500">No districts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 text-sm">
                  <th className="p-3 text-left">District Name</th>
                  <th className="p-3 text-left">Post Office</th>
                  <th className="p-3 text-left">Pincode</th>
                  <th className="p-3 text-left">State</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((district) => (
                  <tr key={district.district_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{district.district_name}</td>
                    <td className="p-3">{district.post_office_name || '-'}</td>
                    <td className="p-3">{district.pincode || '-'}</td>
                    <td className="p-3">{district.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDistrict;