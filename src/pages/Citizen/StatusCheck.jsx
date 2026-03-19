import React, { useState } from 'react';

import { useEnquiryStore } from './../../stores/enquiryStore'; // adjust path as needed
import { useLanguage } from '../../contexts/LanguageContext.jsx';

export default function StatusCheck() {
  const [enquiryId, setEnquiryId] = useState('');
  const [status, setStatus] = useState(null);
  const { t } = useLanguage();
  const enquiries = useEnquiryStore((state) => state.enquiries);


  const handleCheck = (e) => {
    e.preventDefault();
    const enquiry = enquiries.find((item) => item.enquiryId === enquiryId);
    if (enquiry) {
      setStatus(enquiry);
    } else {
      setStatus({ error: t.enquiryIdNotFound || "Enquiry ID not found" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t.checkEnquiryStatus || "Check Enquiry Status"}</h2>
      </div>
      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">{t.enquiryCode || "Enquiry ID"}</label>
          <input
            type="text"
            value={enquiryId}
            onChange={(e) => setEnquiryId(e.target.value)}
            placeholder={t.enterEnquiryId || "Enter Enquiry ID"}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {t.checkStatus || "Check Status"}
        </button>
      </form>
      {status && (
        <div className="mt-4 p-4 border rounded">
          {status.error ? (
            <p className="text-red-600">{status.error}</p>
          ) : (
            <>
              <p><strong>{t.patientName}:</strong> {status.patientName}</p>
              <p><strong>{t.status || 'Status'}:</strong> {status.status}</p>
              <p><strong>{t.hospitalName}:</strong> {status.hospitalName}, {status.hospitalLocation}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
