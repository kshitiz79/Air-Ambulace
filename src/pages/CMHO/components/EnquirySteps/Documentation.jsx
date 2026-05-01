import React from 'react';
import { FaPlus, FaTrash, FaFileImage, FaFilePdf } from 'react-icons/fa';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE_MB = 5;

const getFileIcon = (file) => {
  if (!file) return null;
  if (file.type === 'application/pdf') return <FaFilePdf className="text-red-500 text-lg" />;
  return <FaFileImage className="text-blue-500 text-lg" />;
};

const Documentation = ({ 
  formData, 
  handleChange, 
  language, 
  labels, 
  errors, 
  documentTypeOptions, 
  addDocumentInput, 
  removeDocumentInput 
}) => {
  // Validate file on selection and call handleChange
  const handleFileChange = (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`Document ${idx + 1}: Only JPEG, PNG or PDF files are allowed.`);
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Document ${idx + 1}: File size must be under ${MAX_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }
    handleChange({ target: { name: `documentFile_${idx}`, files: [file] } });
  };

  const uploadedCount = formData.documents.filter(d => d.file).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center mb-2 text-center">
        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mb-2 shadow-md shadow-blue-50">
          <FaPlus className="text-md text-blue-600" />
        </div>
        <h3 className="text-lg font-black text-gray-900 tracking-tighter uppercase">
          {labels[language].documents} <span className="text-red-500">*</span>
        </h3>
        <p className="text-gray-400 mt-0 font-bold tracking-widest uppercase text-[7px] italic">
          JPEG / PNG / PDF · Max {MAX_SIZE_MB}MB each · Multiple uploads supported
        </p>
        {uploadedCount > 0 && (
          <span className="mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded-full uppercase tracking-widest">
            {uploadedCount} file{uploadedCount > 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {errors.documents && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <span className="text-red-500 text-sm">⚠️</span>
          <p className="text-red-600 font-black uppercase text-[10px] tracking-widest">{errors.documents}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.documents.map((doc, idx) => (
          <div
            key={idx}
            className={`group bg-white p-4 rounded-2xl border-2 transition-all duration-300 relative ${
              errors[`document_${idx}`] || errors[`document_${idx}_type`]
                ? 'border-red-300 bg-red-50/30'
                : doc.file
                  ? 'border-green-300 bg-green-50/20'
                  : 'border-gray-100 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Document {idx + 1}
              </span>
              {formData.documents.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDocumentInput(idx)}
                  className="w-6 h-6 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  title="Remove this document"
                >
                  <FaTrash className="text-[9px]" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Type selector */}
              <div>
                <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  name={`docType_${idx}`}
                  value={doc.type}
                  onChange={handleChange}
                  className={`w-full p-2.5 rounded-lg font-black text-blue-900 uppercase tracking-tight focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer text-[10px] border-2 transition-all ${
                    errors[`document_${idx}_type`] ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <option value="">Choose Category...</option>
                  {documentTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors[`document_${idx}_type`] && (
                  <p className="text-red-500 text-[8px] mt-1 font-bold flex items-center gap-1">
                    <span>⚠</span> {errors[`document_${idx}_type`]}
                  </p>
                )}
              </div>

              {/* File upload */}
              <div className="relative">
                <input
                  type="file"
                  id={`docFile_${idx}`}
                  onChange={(e) => handleFileChange(e, idx)}
                  accept="image/jpeg,image/png,application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all min-h-[80px] ${
                  doc.file
                    ? 'border-green-400 bg-green-50'
                    : errors[`document_${idx}`]
                      ? 'border-red-300 bg-red-50/30'
                      : 'border-gray-200 bg-gray-50 group-hover:bg-blue-50/30 group-hover:border-blue-300'
                }`}>
                  {doc.file ? (
                    <div className="flex flex-col items-center gap-1">
                      {getFileIcon(doc.file)}
                      <span className="text-green-800 font-bold text-center truncate w-full px-2 text-[9px] max-w-[160px]">
                        {doc.file.name}
                      </span>
                      <span className="text-green-600 text-[8px] font-bold">
                        {(doc.file.size / 1024).toFixed(0)} KB · Click to replace
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 bg-gray-200 text-gray-400 rounded-lg flex items-center justify-center text-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                        +
                      </div>
                      <span className="text-gray-400 font-black text-[8px] uppercase tracking-widest italic">
                        Click to browse
                      </span>
                      <span className="text-gray-300 text-[7px]">JPEG · PNG · PDF</span>
                    </div>
                  )}
                </div>
                {errors[`document_${idx}`] && (
                  <p className="text-red-500 text-[8px] mt-1 font-bold flex items-center gap-1">
                    <span>⚠</span> {errors[`document_${idx}`]}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add more button */}
        <button
          type="button"
          onClick={addDocumentInput}
          className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-4 flex flex-col items-center justify-center group hover:bg-blue-600 transition-all duration-300 shadow-sm min-h-[160px]"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
            <FaPlus className="text-blue-600 text-sm" />
          </div>
          <span className="font-black text-blue-600 uppercase tracking-widest group-hover:text-white text-[9px]">
            {labels[language].addDocument}
          </span>
          <span className="text-blue-400 group-hover:text-blue-100 text-[7px] mt-1 uppercase font-bold tracking-widest">
            Add another file
          </span>
        </button>
      </div>
    </div>
  );
};

export default Documentation;
