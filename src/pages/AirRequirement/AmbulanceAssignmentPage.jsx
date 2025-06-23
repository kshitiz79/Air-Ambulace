
import  React , { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';

const AmbulanceAssignmentPage = () => {
  const { enquiryId } = useParams();
  const [formData, setFormData] = useState({ ambulanceId: '', pilotId: '' });
  const navigate = useNavigate();
  const addCaseAssignment = useNotificationStore((state) => state.addCaseAssignment);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate assignment
    addCaseAssignment(enquiryId, formData.ambulanceId, formData.pilotId);
    addNotification(`Ambulance assigned for Enquiry ${enquiryId}`);
    alert(`Ambulance assigned for Enquiry ${enquiryId}`);
    navigate('/air');
  };

  // Mock ambulances and pilots
  const ambulances = [
    { id: 'AMB001', name: 'Air Ambulance 1' },
    { id: 'AMB002', name: 'Air Ambulance 2' },
  ];
  const pilots = [
    { id: 'PIL001', name: 'Capt. John Doe' },
    { id: 'PIL002', name: 'Capt. Jane Smith' },
  ];

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Assign Ambulance - {enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Ambulance</label>
          <select
            name="ambulanceId"
            value={formData.ambulanceId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Ambulance</option>
            {ambulances.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Pilot</label>
          <select
            name="pilotId"
            value={formData.pilotId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Pilot</option>
            {pilots.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Assign
        </button>
      </form>
    </div>
  );
};

export default AmbulanceAssignmentPage;