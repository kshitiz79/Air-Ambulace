import React,{ useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';

const ForwardToDMPage = () => {
  const { enquiryId } = useParams();
  const [remarks, setRemarks] = useState('');
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate forwarding
    addNotification(`Enquiry ${enquiryId} forwarded to DM`);
    alert(`Enquiry ${enquiryId} forwarded to DM`);
    navigate('/sdm');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Forward to DM - {enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks for DM"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Forward to DM
        </button>
      </form>
    </div>
  );
};

export default ForwardToDMPage;