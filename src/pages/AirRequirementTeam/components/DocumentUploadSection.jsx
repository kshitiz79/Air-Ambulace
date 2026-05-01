import React from 'react';

const DocumentUploadSection = ({ 
  updateForm, 
  medicalSummaryFile, 
  setMedicalSummaryFile, 
  manifestFile, 
  setManifestFile 
}) => {
  if (updateForm.status !== 'COMPLETED') return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-4">
      {/* Medical Summary upload */}
      <div>
        <label className="block text-[9px] font-black text-green-700 uppercase tracking-widest mb-2">
          🩺 Medical Summary (In-Flight)
        </label>
        <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={e => setMedicalSummaryFile(e.target.files[0])}
          className="w-full px-4 py-3 border-2 border-green-200 rounded-xl text-sm font-medium focus:border-green-500 focus:outline-none transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
        <p className="text-[9px] text-green-600 mt-1 font-medium">
          Upload medical report or summary from the flight crew
        </p>
      </div>

      {/* Flight Manifest upload */}
      <div>
        <label className="block text-[9px] font-black text-green-700 uppercase tracking-widest mb-2">
          📋 Flight Manifest
        </label>
        <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={e => setManifestFile(e.target.files[0])}
          className="w-full px-4 py-3 border-2 border-green-200 rounded-xl text-sm font-medium focus:border-green-500 focus:outline-none transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
        <p className="text-[9px] text-green-600 mt-1 font-medium">
          Upload flight manifest with crew and passenger details
        </p>
      </div>

      {/* Upload Status */}
      <div className="bg-white rounded-xl p-3 border border-green-200">
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Upload Status</p>
          <div className="flex gap-2">
            {medicalSummaryFile && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px] font-bold">
                Medical ✓
              </span>
            )}
            {manifestFile && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[8px] font-bold">
                Manifest ✓
              </span>
            )}
          </div>
        </div>
        <p className="text-[9px] text-gray-600 mt-1">
          {medicalSummaryFile?.name && `Medical: ${medicalSummaryFile.name}`}
          {medicalSummaryFile?.name && manifestFile?.name && ' • '}
          {manifestFile?.name && `Manifest: ${manifestFile.name}`}
          {!medicalSummaryFile && !manifestFile && 'No files selected'}
        </p>
      </div>
    </div>
  );
};

export default DocumentUploadSection;