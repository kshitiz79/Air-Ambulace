import React from 'react';
import { restrictedChange } from '../../../../utils/restrictInput';

const langProps = (language) => language === 'hi'
  ? { lang: 'hi', style: { fontFamily: "'Noto Sans Devanagari', sans-serif" } }
  : {};

const MedicalDetails = ({ formData, handleChange, language, labels, errors }) => {
  const rc = restrictedChange(handleChange, language);
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2 px-1">
        <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
        <h3 className="text-lg font-black text-gray-900 tracking-tight">{labels[language].clinicalAssessment}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest italic">{labels[language].medicalCondition}</label>
          <textarea
            name="medical_condition"
            value={formData.medical_condition}
            onChange={rc}
            rows={3}
            {...langProps(language)}
            className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50/20 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-50 transition-all text-sm font-medium shadow-sm"
            placeholder={language === 'hi' ? 'विस्तृत निदान और वर्तमान स्थिति...' : 'Detailed diagnosis and current state...'}
          />
          {errors.medical_condition && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.medical_condition}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest italic">{labels[language].chiefComplaint}</label>
          <textarea
            name="chief_complaint"
            value={formData.chief_complaint}
            onChange={rc}
            rows={2}
            {...langProps(language)}
            className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50/20 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium"
          />
          {errors.chief_complaint && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.chief_complaint}</p>}
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest italic">{labels[language].generalCondition}</label>
          <input
            type="text"
            name="general_condition"
            value={formData.general_condition}
            onChange={rc}
            {...langProps(language)}
            className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 transition-all font-bold bg-white text-sm"
            placeholder={language === 'hi' ? 'जैसे गंभीर लेकिन स्थिर' : 'e.g. Critical but stable'}
          />
          {errors.general_condition && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.general_condition}</p>}
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest italic">{labels[language].vitals}</label>
          <div className="flex gap-2">
            {['Stable', 'Unstable'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleChange({ target: { name: 'vitals', value: v } })}
                className={`flex-1 p-3 rounded-xl font-black uppercase text-xs tracking-tight transition-all ${
                  formData.vitals === v 
                    ? (v === 'Stable' ? 'bg-green-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md') 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {errors.vitals && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.vitals}</p>}
        </div>
      </div>
    </div>
  );
};

export default MedicalDetails;
