

import React , { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';

const FinancialSanctionPage = () => {
  const { enquiryId } = useParams();
  const [formData, setFormData] = useState({ amount: '', remarks: '' });
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate financial sanction
    addNotification(`Financial sanction of ₹${formData.amount} approved for Enquiry ${enquiryId}`);
    alert(`Financial sanction approved for Enquiry ${enquiryId}`);
    navigate('/dm');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Financial Sanction - {enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Enter remarks"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Authorize Sanction
        </button>
      </form>
    </div>
  );
};

export default FinancialSanctionPage;