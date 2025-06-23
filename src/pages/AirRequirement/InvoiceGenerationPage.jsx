import React ,{ useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';

const InvoiceGenerationPage = () => {
  const { enquiryId } = useParams();
  const [formData, setFormData] = useState({
    amount: '',
    serviceDetails: '',
    invoiceNumber: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
  });
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate invoice generation
    addNotification(`Invoice ${formData.invoiceNumber} generated for Enquiry ${enquiryId}`);
    alert(`Invoice ${formData.invoiceNumber} generated for Enquiry ${enquiryId}`);
    navigate('/air');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Generate Invoice - {enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Invoice Number</label>
          <input
            type="text"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
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
          <label className="block text-sm font-medium">Service Details</label>
          <textarea
            name="serviceDetails"
            value={formData.serviceDetails}
            onChange={handleChange}
            placeholder="Enter service details"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Generate Invoice
        </button>
      </form>
    </div>
  );
};

export default InvoiceGenerationPage;