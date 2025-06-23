

import  React , { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';

const OrderReleasePage = () => {
  const { enquiryId } = useParams();
  const [orderDetails, setOrderDetails] = useState('');
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate order release
    addNotification(`Order released for Enquiry ${enquiryId}`);
    alert(`Order released for Enquiry ${enquiryId}`);
    navigate('/dm');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Release Order - {enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Order Details</label>
          <textarea
            value={orderDetails}
            onChange={(e) => setOrderDetails(e.target.value)}
            placeholder="Enter order details"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="5"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Release Order
        </button>
      </form>
    </div>
  );
};

export default OrderReleasePage;