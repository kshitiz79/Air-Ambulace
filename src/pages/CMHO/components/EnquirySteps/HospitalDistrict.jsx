import React from 'react';

const HospitalDistrict = ({ formData, handleChange, language, labels, errors, hospitals, districts }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg shadow-gray-50/50">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
            <h3 className="text-lg font-black text-gray-900 uppercase">{labels[language].routing}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest italic">{labels[language].sourceHospitalId}</label>
              <select
                name="source_hospital_id"
                value={formData.source_hospital_id}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50/50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
              >
                <option value="">{language === 'en' ? 'Choose Origin...' : 'स्रोत चुनें...'}</option>
                {hospitals.map(h => (
                  <option key={h.hospital_id} value={h.hospital_id}>{h.name}</option>
                ))}
              </select>
              {errors.source_hospital_id && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.source_hospital_id}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest italic">{labels[language].hospitalId}</label>
              <select
                name="hospital_id"
                value={formData.hospital_id}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50/50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
              >
                <option value="">{language === 'en' ? 'Choose Destination...' : 'गंतव्य चुनें...'}</option>
                {hospitals.map(h => (
                  <option key={h.hospital_id} value={h.hospital_id}>{h.name}</option>
                ))}
              </select>
              {errors.hospital_id && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.hospital_id}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest italic">{labels[language].destinationDistrict}</label>
              <select
                name="district_id"
                value={formData.district_id}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50/50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
              >
                <option value="">{language === 'en' ? 'Choose District...' : 'जिला चुनें...'}</option>
                {districts.map(d => (
                  <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                ))}
              </select>
              {errors.district_id && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.district_id}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-6 rounded-2xl border-2 transition-all duration-500 h-full flex flex-col justify-center ${
            formData.escalate_case 
              ? 'bg-red-50/50 border-red-200 shadow-lg shadow-red-50' 
              : 'bg-gray-50/50 border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${formData.escalate_case ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <h3 className={`text-lg font-black uppercase tracking-tight ${formData.escalate_case ? 'text-red-900' : 'text-gray-400'}`}>
                  {formData.escalate_case ? labels[language].highPriority : labels[language].normalPriority}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'escalate_case', type: 'checkbox', checked: !formData.escalate_case } })}
                className={`w-12 h-6 rounded-full relative transition-all ${formData.escalate_case ? 'bg-red-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm ${formData.escalate_case ? 'right-1 bg-white' : 'left-1 bg-white'}`}></div>
              </button>
            </div>
            
            {formData.escalate_case && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-[9px] font-black text-red-800 uppercase tracking-widest mb-1 shadow-sm px-2 inline-block bg-white italic">Justification for Escalation</label>
                  <textarea
                    name="escalation_reason"
                    value={formData.escalation_reason}
                    onChange={handleChange}
                    rows={2}
                    className="w-full bg-white border-2 border-red-100 p-3 rounded-xl text-gray-900 placeholder-gray-400 focus:border-red-500 transition-all font-semibold text-xs italic shadow-sm"
                    placeholder="Describe the immediate medical threat or logical failure requiring escalation..."
                  />
                  {errors.escalation_reason && <p className="text-red-600 text-[9px] mt-1 font-bold uppercase">{errors.escalation_reason}</p>}
                </div>
                <div>
                  <label className="block text-[9px] font-black text-red-800 uppercase tracking-widest mb-1 shadow-sm px-2 inline-block bg-white rounded-md border border-red-100 italic">Target Authority</label>
                  <select
                    name="escalated_to"
                    value={formData.escalated_to}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-red-100 p-3 rounded-xl text-gray-900 focus:border-red-500 transition-all font-black uppercase text-xs shadow-sm"
                  >
                    <option value="">{labels[language].selectTargetAgency}</option>
                    <option value="District Magistrate">District Magistrate</option>
                    <option value="Chief Medical Officer">Chief Medical Officer</option>
                    <option value="State Health Department">State Health Department</option>
                    <option value="Emergency Response Team">Emergency Response Team</option>
                    <option value="Senior Medical Authority">Senior Medical Authority</option>
                  </select>
                  {errors.escalated_to && <p className="text-red-600 text-[9px] mt-1 font-bold uppercase">{errors.escalated_to}</p>}
                </div>
                <div>
                  <label className="block text-[9px] font-black text-red-800 uppercase tracking-widest mb-1 shadow-sm px-2 inline-block bg-white rounded-md border border-red-100 italic">Emergency Proof (Certification)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => handleChange({ target: { name: 'emergency_proof', value: e.target.files[0] } })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*,application/pdf"
                    />
                    <div className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${formData.emergency_proof ? 'border-red-500 bg-red-50' : 'border-red-100 bg-white group-hover:bg-red-50/50'}`}>
                      {formData.emergency_proof ? (
                        <>
                          <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center mb-1 text-[10px] shadow-sm">✓</div>
                          <span className="text-red-900 font-bold text-center truncate w-full px-2 text-[9px]">{formData.emergency_proof.name}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 bg-red-50 text-red-400 rounded-lg flex items-center justify-center mb-1 text-xs group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">+</div>
                          <span className="text-red-400 font-black text-[8px] uppercase tracking-widest italic text-center">Upload Proof of Emergency<br/>(Doctor/Hosp. Cert.)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!formData.escalate_case && (
              <div className="text-center py-4">
                <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest italic">Normal Priority Channel</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDistrict;
