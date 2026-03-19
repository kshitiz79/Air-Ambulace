import React from 'react';
import { restrictedChange } from '../../../../utils/restrictInput';

const langProps = (language) => language === 'hi'
  ? { lang: 'hi', style: { fontFamily: "'Noto Sans Devanagari', sans-serif" } }
  : {};

const PatientDetails = ({ formData, handleChange, language, labels, errors }) => {
  const rc = restrictedChange(handleChange, language);
  return (
    <div className="space-y-4">
      {/* Quick Access: Transportation Category */}
      <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <div className="w-1 h-5 bg-white rounded-full mr-2"></div>
            <h3 className="text-lg font-black uppercase tracking-tight">
              {labels[language].transportationCategory} & {labels[language].airTransportType}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-blue-100 italic">
                {labels[language].transportationCategory}
              </label>
              <select
                name="transportation_category"
                value={formData.transportation_category}
                onChange={handleChange}
                className="w-full p-3 bg-white/10 border-white/20 border-2 rounded-xl focus:bg-white focus:text-blue-900 focus:ring-0 transition-all font-bold text-sm backdrop-blur-md appearance-none"
              >
                <option value="" className="text-gray-900">{language === 'en' ? 'Choose Category...' : 'श्रेणी चुनें...'}</option>
                <option value="Within Division" className="text-gray-900">Within Division</option>
                <option value="Out of Division" className="text-gray-900">Out of Division</option>
                <option value="Out of State" className="text-gray-900">Out of State</option>
              </select>
              {errors.transportation_category && (
                <p className="text-orange-300 text-[10px] mt-1 font-bold uppercase">{errors.transportation_category}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-blue-100 italic">
                {labels[language].airTransportType}
              </label>
              <select
                name="air_transport_type"
                value={formData.air_transport_type}
                onChange={handleChange}
                className="w-full p-3 bg-white/10 border-white/20 border-2 rounded-xl focus:bg-white focus:text-blue-900 focus:ring-0 transition-all font-bold text-sm backdrop-blur-md appearance-none"
              >
                <option value="" className="text-gray-900">{language === 'en' ? 'Choose Type...' : 'प्रकार चुनें...'}</option>
                <option value="Free" className="text-gray-900">Free Seva</option>
                <option value="Paid" className="text-gray-900">Paid Seva</option>
              </select>
              {errors.air_transport_type && (
                <p className="text-orange-300 text-[10px] mt-1 font-bold uppercase">{errors.air_transport_type}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Biography Section */}
      <div>
        <div className="flex items-center mb-3 px-1">
          <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">{labels[language].patientBiography}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest italic">{labels[language].patientName}</label>
            <input
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={rc}
              {...langProps(language)}
              className="w-full p-3.5 border-2 border-gray-50 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 transition-all text-base font-bold text-gray-800 bg-gray-50/30"
              placeholder={language === 'hi' ? 'जैसे राहुल शर्मा' : 'e.g. Rahul Sharma'}
            />
            {errors.patient_name && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.patient_name}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest italic">{labels[language].fatherSpouseName}</label>
            <input
              type="text"
              name="father_spouse_name"
              value={formData.father_spouse_name}
              onChange={rc}
              {...langProps(language)}
              className="w-full p-3 border-gray-100 border-2 rounded-xl focus:border-blue-500 focus:bg-blue-50/10 transition-all font-semibold text-sm"
            />
            {errors.father_spouse_name && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.father_spouse_name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest italic">{labels[language].age}</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-3 border-gray-100 border-2 rounded-xl focus:border-blue-500 transition-all font-bold text-sm"
              />
              {errors.age && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.age}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest italic">{labels[language].gender}</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 border-gray-100 border-2 rounded-xl focus:border-blue-500 transition-all font-bold bg-white text-sm"
              >
                <option value="">{language === 'en' ? 'Choose Gender...' : 'लिंग चुनें...'}</option>
                <option value="Male">{labels[language].male}</option>
                <option value="Female">{labels[language].female}</option>
                <option value="Other">{labels[language].other}</option>
              </select>
              {errors.gender && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.gender}</p>}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest italic">{labels[language].address}</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={rc}
              rows={2}
              {...langProps(language)}
              className="w-full p-3 border-gray-100 border-2 rounded-xl focus:border-blue-500 transition-all font-medium text-sm"
              placeholder={language === 'hi' ? 'पूरा आवासीय पता...' : 'Full residential address...'}
            />
            {errors.address && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.address}</p>}
          </div>
        </div>
      </div>

      {/* Identity Information Section */}
      <div>
        <div className="flex items-center mb-3 px-1">
          <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">{labels[language].identityInfo}</h3>
        </div>
        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-700 mb-2 uppercase tracking-widest italic">{labels[language].identityCardType}</label>
              <div className="grid grid-cols-2 gap-2">
                {['ABHA', 'PM_JAY'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      handleChange({ target: { name: 'identity_card_type', value: type } });
                    }}
                    className={`p-3 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all ${
                      formData.identity_card_type === type 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                        : 'bg-white border-gray-50 text-gray-400 hover:border-blue-200'
                    }`}
                  >
                    {type === 'ABHA' ? 'ABHA' : 'PM JAY'}
                  </button>
                ))}
              </div>
              {errors.identity_card_type && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.identity_card_type}</p>}
            </div>

            <div className="flex flex-col justify-end">
              {formData.identity_card_type && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-blue-600 mb-1.5 uppercase tracking-widest italic">
                    {formData.identity_card_type === 'ABHA' ? labels[language].abhaNumber : labels[language].pmJayId}
                  </label>
                  <input
                    type="text"
                    name="ayushman_card_number"
                    value={formData.ayushman_card_number}
                    onChange={handleChange}
                    placeholder={formData.identity_card_type === 'ABHA' ? '14-digit ABHA ID' : '9-digit PM JAY ID'}
                    maxLength={formData.identity_card_type === 'ABHA' ? 14 : 9}
                    className="w-full p-3 border-gray-100 border-2 rounded-xl focus:ring-2 focus:ring-blue-50 focus:border-blue-500 shadow-sm transition-all font-bold text-sm"
                  />
                  {errors.ayushman_card_number && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.ayushman_card_number}</p>}
                </div>
              )}
            </div>
          </div>

          {!formData.identity_card_type && (
            <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
              <p className="text-[9px] font-black text-gray-400 mb-4 text-center uppercase tracking-widest italic">
                {labels[language].orProvideBothAadharPan}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-600 mb-1.5 uppercase tracking-widest italic">{labels[language].aadharCard}</label>
                  <input
                    type="text"
                    name="aadhar_card_number"
                    value={formData.aadhar_card_number}
                    onChange={handleChange}
                    placeholder="0000 0000 0000"
                    maxLength={12}
                    className="w-full p-3 border-gray-100 border-2 rounded-xl focus:border-blue-500 bg-white transition-all font-mono text-sm"
                  />
                  {errors.aadhar_card_number && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.aadhar_card_number}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-600 mb-1.5 uppercase tracking-widest italic">{labels[language].panCard}</label>
                  <input
                    type="text"
                    name="pan_card_number"
                    value={formData.pan_card_number}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      handleChange({ target: { name: 'pan_card_number', value } });
                    }}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full p-3 border-gray-100 border-2 rounded-xl focus:border-blue-500 bg-white transition-all font-mono text-sm"
                  />
                  {errors.pan_card_number && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.pan_card_number}</p>}
                </div>
              </div>
              {errors.identity_fallback && (
                <p className="text-red-500 text-[10px] mt-4 font-black text-center uppercase italic">
                  {errors.identity_fallback}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
