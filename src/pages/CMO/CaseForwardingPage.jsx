import  React  ,{ useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';

const CaseForwardingPage = () => {
  const [formData, setFormData] = useState({
    enquiryId: '',
    hospitalName: '',
    remarks: '',
  });
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    addNotification(`Case ${formData.enquiryId} forwarded to SDM`);
    alert(`Case ${formData.enquiryId} forwarded to SDM`);
    navigate('/cmo/case-status');
    navigate
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Forward Case</h2>
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
          <label className="block text-sm font-medium">Hospital Name</label>
          <input
            type="text"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleChange}
            placeholder="Enter hospital name"
            class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Enter forwarding remarks"
            class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          Forward Case
        </button>
      </form>
    </div>
  );
};

export default CaseForwardingPage;