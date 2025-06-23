import { useState } from 'react';
import { useNotificationStore } from './../../stores/notificationStore'; // adjust path accordingly
import React from 'react';
export default function DoxUpload() {
  const [files, setFiles] = useState([]);
  const [enquiryId, setEnquiryId] = useState('');
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length > 0) {
      alert(`Documents uploaded for Enquiry ID: ${enquiryId}`);
      addNotification(`Documents uploaded for Enquiry ID: ${enquiryId}`);
      setFiles([]);
      setEnquiryId('');
    } else {
      alert('Please select at least one file.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Enquiry ID</label>
          <input
            type="text"
            value={enquiryId}
            onChange={(e) => setEnquiryId(e.target.value)}
            placeholder="Enter Enquiry ID"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Upload Documents (e.g., Ayushman Card, ID Proof)</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Upload Documents
        </button>
      </form>
    </div>
  );
}
