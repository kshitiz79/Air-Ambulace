import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

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
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center mb-4 text-center">
        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mb-2 shadow-md shadow-blue-50">
          <FaPlus className="text-md text-blue-600" />
        </div>
        <h3 className="text-lg font-black text-gray-900 tracking-tighter uppercase">{labels[language].documents}</h3>
        <p className="text-gray-400 mt-0 font-bold tracking-widest uppercase text-[7px] italic">Secure encrypted upload</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.documents.map((doc, idx) => (
          <div key={idx} className="group bg-white p-4 rounded-2xl border-2 border-gray-50 hover:border-blue-500 hover:shadow-lg transition-all duration-500 relative">
            <div className="absolute -top-2 -right-2">
              {formData.documents.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDocumentInput(idx)}
                  className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-md"
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Select Document Type</label>
                <select
                  name={`docType_${idx}`}
                  value={doc.type}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border-0 rounded-lg font-black text-blue-900 uppercase tracking-tight focus:ring-1 focus:ring-blue-100 appearance-none cursor-pointer text-[10px]"
                >
                  <option value="">Choose Category...</option>
                  {documentTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors[`document_${idx}_type`] && <p className="text-red-500 text-[8px] mt-1 font-bold uppercase">{errors[`document_${idx}_type`]}</p>}
              </div>
              <div className="relative">
                <input
                  type="file"
                  name={`documentFile_${idx}`}
                  onChange={handleChange}
                  accept="image/jpeg,image/png,application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${doc.file ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50 group-hover:bg-blue-50/30'}`}>
                  {doc.file ? (
                    <>
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center mb-1 text-xs">✓</div>
                      <span className="text-green-800 font-bold text-center truncate w-full px-2 text-[9px]">{doc.file.name}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 bg-gray-200 text-gray-400 rounded-lg flex items-center justify-center mb-1 text-xs group-hover:bg-blue-500 group-hover:text-white transition-all">+</div>
                      <span className="text-gray-400 font-black text-[8px] uppercase tracking-widest italic">Click to browse</span>
                    </>
                  )}
                </div>
                {errors[`document_${idx}`] && <p className="text-red-500 text-[8px] mt-1 font-bold uppercase">{errors[`document_${idx}`]}</p>}
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addDocumentInput}
          className="bg-blue-50 border-2 border-dashed border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center group hover:bg-blue-600 transition-all duration-500 shadow-sm"
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FaPlus className="text-blue-600 text-[10px]" />
          </div>
          <span className="font-black text-blue-600 uppercase tracking-widest group-hover:text-white text-[9px]">{labels[language].addDocument}</span>
        </button>
      </div>
      {errors.documents && <p className="text-red-600 text-center font-black uppercase text-[10px] tracking-widest italic">{errors.documents}</p>}
    </div>
  );
};

export default Documentation;
