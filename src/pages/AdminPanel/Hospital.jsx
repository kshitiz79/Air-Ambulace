import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';

const CreateHospital = () => {
  const [formData, setFormData] = useState({
    hospital_name: '',
    district_id: '',
    address: '',
    contact_phone: '',
    contact_email: '',
    hospital_type: 'PRIVATE',
    contact_person_name: '',
    contact_person_phone: '',
    contact_person_email: '',
    registration_number: '',
  });
  const [districts, setDistricts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch districts and hospitals on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch districts for the dropdown
        const districtResponse = await axios.get(`${baseUrl}/api/districts`);
        setDistricts(districtResponse.data);

        // Fetch hospitals for the list
        const hospitalResponse = await axios.get(`${baseUrl}/api/hospitals`);
        setHospitals(hospitalResponse.data.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${baseUrl}/api/hospitals`, formData);
      setSuccess('Hospital created successfully!');
      setFormData({
        hospital_name: '',
        district_id: '',
        address: '',
        contact_phone: '',
        contact_email: '',
        hospital_type: 'PRIVATE',
        contact_person_name: '',
        contact_person_phone: '',
        contact_person_email: '',
        registration_number: '',
      });
      // Refresh hospital list
      const updatedHospitals = await axios.get(`${baseUrl}/api/hospitals`);
      setHospitals(updatedHospitals.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create hospital');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create New Hospital</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="hospital_name" className="block text-sm font-medium text-gray-700">
              Hospital Name
            </label>
            <input
              type="text"
              id="hospital_name"
              name="hospital_name"
              value={formData.hospital_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="district_id" className="block text-sm font-medium text-gray-700">
              District
            </label>
            <select
              id="district_id"
              name="district_id"
              value={formData.district_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.district_id} value={district.district_id}>
                  {district.district_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
              Hospital Phone
            </label>
            <input
              type="text"
              id="contact_phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
              Hospital Email
            </label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="hospital_type" className="block text-sm font-medium text-gray-700">
              Hospital Type
            </label>
            <select
              id="hospital_type"
              name="hospital_type"
              value={formData.hospital_type}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PRIVATE">Private</option>
              <option value="GOVERNMENT">Government</option>
            </select>
          </div>
          <div>
            <label htmlFor="contact_person_name" className="block text-sm font-medium text-gray-700">
              Contact Person Name
            </label>
            <input
              type="text"
              id="contact_person_name"
              name="contact_person_name"
              value={formData.contact_person_name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="contact_person_phone" className="block text-sm font-medium text-gray-700">
              Contact Person Phone
            </label>
            <input
              type="text"
              id="contact_person_phone"
              name="contact_person_phone"
              value={formData.contact_person_phone}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="contact_person_email" className="block text-sm font-medium text-gray-700">
              Contact Person Email
            </label>
            <input
              type="email"
              id="contact_person_email"
              name="contact_person_email"
              value={formData.contact_person_email}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <input
              type="text"
              id="registration_number"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Create Hospital
          </button>
        </form>
      </div>

      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Hospital List</h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading hospitals...</p>
        ) : hospitals.length === 0 ? (
          <p className="text-center text-gray-500">No hospitals found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 text-sm">
                  <th className="p-3 text-left">Hospital Name</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Address</th>
                  <th className="p-3 text-left">Contact Phone</th>
                  <th className="p-3 text-left">Contact Email</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Contact Person</th>
                  <th className="p-3 text-left">Registration Number</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map((hospital) => (
                  <tr key={hospital.hospital_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{hospital.name}</td>
                    <td className="p-3">{hospital.district?.district_name || '-'}</td>
                    <td className="p-3">{hospital.address || '-'}</td>
                    <td className="p-3">{hospital.contact_phone || '-'}</td>
                    <td className="p-3">{hospital.contact_email || '-'}</td>
                    <td className="p-3">{hospital.hospital_type}</td>
                    <td className="p-3">{hospital.contact_person_name || '-'}</td>
                    <td className="p-3">{hospital.registration_number || '-'}</td>
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

export default CreateHospital;