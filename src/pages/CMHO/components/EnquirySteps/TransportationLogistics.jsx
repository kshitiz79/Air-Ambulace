import React from 'react';
import { restrictedChange } from '../../../../utils/restrictInput';

const langProps = (language) => language === 'hi'
  ? { lang: 'hi', style: { fontFamily: "'Noto Sans Devanagari', sans-serif" } }
  : {};

const TransportationLogistics = ({ formData, handleChange, language, labels, errors }) => {
  const rc = restrictedChange(handleChange, language);
  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg shadow-gray-50/50">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-emerald-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-black text-emerald-900 uppercase">Confirmation</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center p-3 bg-emerald-50/30 rounded-xl cursor-pointer border-2 border-transparent hover:border-emerald-200 transition-all">
              <input
                type="checkbox"
                name="bed_availability_confirmed"
                checked={formData.bed_availability_confirmed}
                onChange={handleChange}
                className="w-5 h-5 rounded text-emerald-600 border-gray-300 focus:ring-0 transition-all"
              />
              <span className="ml-3 text-xs font-black text-emerald-800 uppercase tracking-tight italic">
                {labels[language].bedAvailabilityConfirmed}
              </span>
            </label>
            <label className="flex items-center p-3 bg-emerald-50/30 rounded-xl cursor-pointer border-2 border-transparent hover:border-emerald-200 transition-all">
              <input
                type="checkbox"
                name="als_ambulance_arranged"
                checked={formData.als_ambulance_arranged}
                onChange={handleChange}
                className="w-5 h-5 rounded text-emerald-600 border-gray-300 focus:ring-0 transition-all"
              />
              <span className="ml-3 text-xs font-black text-emerald-800 uppercase tracking-tight italic">
                {labels[language].alsAmbulanceArranged}
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-3 flex flex-col justify-center bg-white p-4 rounded-2xl border border-gray-100 shadow-lg shadow-gray-50/50">
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-widest italic">{labels[language].ambulanceRegistrationNumber}</label>
            <input
              type="text"
              name="ambulance_registration_number"
              value={formData.ambulance_registration_number}
              onChange={handleChange}
              placeholder="e.g. CG 04 MP 1234"
              className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-blue-500 transition-all text-lg font-black tracking-widest uppercase text-blue-900 bg-gray-50/20"
            />
            {errors.ambulance_registration_number && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.ambulance_registration_number}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest italic">{labels[language].ambulanceContact}</label>
            <input
              type="text"
              name="ambulance_contact"
              value={formData.ambulance_contact}
              onChange={handleChange}
              className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-blue-500 transition-all text-base font-bold bg-white"
            />
            {errors.ambulance_contact && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.ambulance_contact}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest italic">{labels[language].medicalTeamNote}</label>
            <textarea
              name="medical_team_note"
              value={formData.medical_team_note}
              onChange={rc}
              rows={2}
              {...langProps(language)}
              className="w-full p-3 bg-gray-50/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm italic"
              placeholder={language === 'hi' ? 'साथ आने वाले डॉक्टरों और पैरामेडिक्स के नाम...' : 'Names of doctors and paramedics accompanying...'}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest italic">{labels[language].remarks}</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={rc}
              rows={2}
              {...langProps(language)}
              className="w-full p-3 bg-gray-50/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm italic"
              placeholder={language === 'hi' ? 'कोई अतिरिक्त जानकारी...' : 'Any additional information...'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportationLogistics;
