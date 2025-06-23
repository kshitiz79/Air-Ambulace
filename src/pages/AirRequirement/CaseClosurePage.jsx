import React ,{ useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';

const CaseClosurePage = () => {
  const { enquiryId } = useParams();
  const [remarks, setRemarks] = useState('');
  const navigate = useNavigate();
  const updateCaseStatus = useNotificationStore((state) => state.updateCaseStatus);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate case closure
    updateCaseStatus(enquiryId, 'CLOSED');
    addNotification(`Case ${enquiryId} closed`);
    alert(`Case ${enquiryId} closed`);
    navigate('/air');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Close Case - {enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Final Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter final remarks"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Close Case
        </button>
      </form>
    </div>
  );
};

export default CaseClosurePage;