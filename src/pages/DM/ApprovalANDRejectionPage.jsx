import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';
import { useLanguage } from '../../contexts/LanguageContext';

const ApprovalRejectionPage = () => {
  const { enquiryId } = useParams();
  const [formData, setFormData] = useState({ status: 'APPROVED', reasons: '', signature: '' });
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const { t } = useLanguage();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate approval/rejection
    addNotification(`${t.enquiry} ${enquiryId} ${t[formData.status.toLowerCase()]}`);
    alert(`${t.enquiry} ${enquiryId} ${t[formData.status.toLowerCase()]}`);
    navigate('/collector-dashboard');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{t.approveRejectEnquiry} - {enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">{t.status}</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="APPROVED">{t.approved}</option>
            <option value="REJECTED">{t.rejected}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">{t.reasons}</label>
          <textarea
            name="reasons"
            value={formData.reasons}
            onChange={handleChange}
            placeholder={t.enterReasons}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">{t.digitalSignature}</label>
          <input
            type="text"
            name="signature"
            value={formData.signature}
            onChange={handleChange}
            placeholder={t.enterSignature}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {t.submit}
        </button>
      </form>
    </div>
  );
};

export default ApprovalRejectionPage;
