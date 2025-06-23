import React, { useState } from 'react';
import { useNotificationStore } from './../../stores/notificationStore';

const DocumentUploadAndVerificationPage = () => {

  const [verifyData, setVerifyData] = useState({ enquiryId: '', status: 'verified', remarks: '' });
  const [verificationResult, setVerificationResult] = useState(null);
  const addNotification = useNotificationStore((state) => state.addNotification);

  /* ---------- upload handlers ---------- */


  /* ---------- verify handlers ---------- */
  const handleVerifyChange = (e) =>
    setVerifyData({ ...verifyData, [e.target.name]: e.target.value });

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    setVerificationResult({
      enquiryId: verifyData.enquiryId,
      status: verifyData.status.toUpperCase(),
      remarks: verifyData.remarks,
    });
    addNotification(`Documents ${verifyData.status} for Enquiry ID: ${verifyData.enquiryId}`);
    setVerifyData({ enquiryId: '', status: 'verified', remarks: '' });
  };

  return (
    <div className=" mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Document Upload &amp; Verification</h2>

      <div className="max-w-3xl mx-auto gap-6">
        {/* ---------- Upload ---------- */}
        

        {/* ---------- Verify ---------- */}
        <div>
          <h3 className="text-lg font-medium mb-4">Verify Documents</h3>
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Enquiry ID</label>
              <input
                type="text"
                name="enquiryId"
                value={verifyData.enquiryId}
                onChange={handleVerifyChange}
                placeholder="Enter Enquiry ID"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Verification Status</label>
              <select
                name="status"
                value={verifyData.status}
                onChange={handleVerifyChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Remarks</label>
              <textarea
                name="remarks"
                value={verifyData.remarks}
                onChange={handleVerifyChange}
                placeholder="Enter remarks"
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              Submit Verification
            </button>
          </form>

          {verificationResult && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <p>
                <strong>Enquiry ID:</strong> {verificationResult.enquiryId}
              </p>
              <p>
                <strong>Status:</strong> {verificationResult.status}
              </p>
              {verificationResult.remarks && (
                <p>
                  <strong>Remarks:</strong> {verificationResult.remarks}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadAndVerificationPage;
