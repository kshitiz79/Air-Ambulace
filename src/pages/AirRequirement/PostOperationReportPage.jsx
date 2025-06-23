import React , { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';

const PostOperationReportPage = () => {
  const { enquiryId } = useParams();
  const [formData, setFormData] = useState({
    flightDetails: '',
    patientCondition: '',
    remarks: '',
  });
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate report submission
    addNotification(`Post-operation report submitted for Enquiry ${enquiryId}`);
    alert(`Post-operation report submitted for Enquiry ${enquiryId}`);
    navigate('/air');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Post-Operation Report - {enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Flight Details</label>
          <textarea
            name="flightDetails"
            value={formData.flightDetails}
            onChange={handleChange}
            placeholder="Enter flight details"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Patient Condition</label>
          <textarea
            name="patientCondition"
            value={formData.patientCondition}
            onChange={handleChange}
            placeholder="Enter patient condition"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
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
            rows="3"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
};

export default PostOperationReportPage;