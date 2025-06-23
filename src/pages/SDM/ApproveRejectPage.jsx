import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';

const ApproveRejectPage = () => {
  const { enquiryId } = useParams();
  const [formData, setFormData] = useState({ status: 'APPROVED', comments: '', signature: '' });
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate approval/rejection
    addNotification(`Enquiry ${enquiryId} ${formData.status.toLowerCase()}`);
    alert(`Enquiry ${enquiryId} ${formData.status.toLowerCase()}`);
    navigate('/sdm');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Approve/Reject Enquiry - {enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Comments</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            placeholder="Enter comments"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Digital Signature</label>
          <input
            type="text"
            name="signature"
            value={formData.signature}
            onChange={handleChange}
            placeholder="Enter signature (simulated)"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ApproveRejectPage;