import React from 'react'

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BeneficiaryDetailsEditPage = () => {
  const [formData, setFormData] = useState({
    enquiryId: '',
    patientName: '',
    ayushmanCard: '',
    contactPhone: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    alert(`Details updated for Enquiry ID: ${formData.enquiryId}`);
    navigate('/cmo');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Edit Beneficiary Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Enquiry ID</label>
          <input
            type="text"
            name="enquiryId"
            value={formData.enquiryId}
            onChange={handleChange}
            placeholder="Enter Enquiry ID"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Patient Name</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            placeholder="Enter Patient Name"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Ayushman Card Number</label>
          <input
            type="text"
            name="ayushmanCard"
            value={formData.ayushmanCard}
            onChange={handleChange}
            placeholder="Enter card number"
            className="w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Contact Phone</label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          Update Details
        </button>
      </form>
    </div>
  );
};

export default BeneficiaryDetailsEditPage;