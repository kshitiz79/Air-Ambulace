import React from 'react';
import { restrictedChange } from '../../../../utils/restrictInput';

const langProps = (language) => language === 'hi'
  ? { lang: 'hi', style: { fontFamily: "'Noto Sans Devanagari', sans-serif" } }
  : {};

const ContactInformation = ({ formData, handleChange, language, labels, errors }) => {
  const rc = restrictedChange(handleChange, language);
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2 px-1">
        <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
        <h3 className="text-lg font-black text-gray-900 tracking-tight text-center w-full">{labels[language].emergencyContactProfile}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-lg shadow-gray-50">
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest italic">{labels[language].contactName}</label>
          <input
            type="text"
            name="contact_name"
            value={formData.contact_name}
            onChange={rc}
            {...langProps(language)}
            className="w-full p-3.5 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 transition-all text-base font-bold"
            placeholder={language === 'hi' ? 'संपर्क व्यक्ति का नाम' : 'Primary Point of Contact'}
          />
          {errors.contact_name && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.contact_name}</p>}
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest italic">{labels[language].contactPhone}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm italic">+91</span>
            <input
              type="text"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              maxLength={10}
              className="w-full p-3 pl-14 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 transition-all text-base font-bold"
            />
          </div>
          {errors.contact_phone && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.contact_phone}</p>}
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest italic">{labels[language].contactEmail}</label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            className="w-full p-3 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 transition-all font-semibold text-sm"
            placeholder="contact@example.com"
          />
          {errors.contact_email && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.contact_email}</p>}
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
