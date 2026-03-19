import React from 'react';
import { restrictedChange } from '../../../../utils/restrictInput';

const langProps = (language) => language === 'hi'
  ? { lang: 'hi', style: { fontFamily: "'Noto Sans Devanagari', sans-serif" } }
  : {};

const ReferralDetails = ({ formData, handleChange, language, labels, errors }) => {
  const rc = restrictedChange(handleChange, language);
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 text-gray-900 border border-gray-100 shadow-lg shadow-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent)]"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-3 pb-2 border-b border-gray-50">
            <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
            <h3 className="text-lg font-black uppercase tracking-tight">{labels[language].referralMatrix}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 italic">{labels[language].physicianOnDuty}</p>
              <div>
                <input
                  type="text"
                  name="referring_physician_name"
                  value={formData.referring_physician_name}
                  onChange={rc}
                  {...langProps(language)}
                  placeholder={labels[language].fullName}
                  className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-base"
                />
                {errors.referring_physician_name && <p className="text-red-400 text-[9px] mt-1 font-bold uppercase">{errors.referring_physician_name}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="referring_physician_designation"
                  value={formData.referring_physician_designation}
                  onChange={rc}
                  {...langProps(language)}
                  placeholder={labels[language].designationRank}
                  className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-semibold text-xs"
                />
                {errors.referring_physician_designation && <p className="text-red-400 text-[9px] mt-1 font-bold uppercase">{errors.referring_physician_designation}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-orange-600 italic">{labels[language].officialDirectives}</p>
              <textarea
                name="referral_note"
                value={formData.referral_note}
                onChange={rc}
                rows={3}
                {...langProps(language)}
                className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-blue-500 transition-all text-sm italic"
                placeholder={labels[language].internalNotes}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        <div className="space-y-3 p-3 bg-white rounded-xl border border-gray-50 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-[10px] uppercase">RA</div>
            <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-tight italic">{labels[language].recommendingAuthority}</h4>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              name="recommending_authority_name"
              value={formData.recommending_authority_name}
              onChange={rc}
              {...langProps(language)}
              placeholder={labels[language].fullName}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 transition-all font-bold text-sm bg-gray-50/20"
            />
            {errors.recommending_authority_name && <p className="text-red-500 text-[9px] mt-1 font-bold uppercase">{errors.recommending_authority_name}</p>}
            <input
              type="text"
              name="recommending_authority_designation"
              value={formData.recommending_authority_designation}
              onChange={rc}
              {...langProps(language)}
              placeholder={labels[language].designationRank}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 transition-all text-xs"
            />
            {errors.recommending_authority_designation && <p className="text-red-500 text-[9px] mt-1 font-bold uppercase">{errors.recommending_authority_designation}</p>}
          </div>
        </div>
        <div className="space-y-3 p-3 bg-white rounded-xl border border-gray-50 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-[10px] uppercase">AA</div>
            <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-tight italic">{labels[language].approvalAuthority}</h4>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              name="approval_authority_name"
              value={formData.approval_authority_name}
              onChange={rc}
              {...langProps(language)}
              placeholder={labels[language].fullName}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-green-500 transition-all font-bold text-sm bg-gray-50/20"
            />
            {errors.approval_authority_name && <p className="text-red-500 text-[9px] mt-1 font-bold uppercase">{errors.approval_authority_name}</p>}
            <input
              type="text"
              name="approval_authority_designation"
              value={formData.approval_authority_designation}
              onChange={rc}
              {...langProps(language)}
              placeholder={labels[language].designationRank}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-green-500 transition-all text-xs"
            />
            {errors.approval_authority_designation && <p className="text-red-500 text-[9px] mt-1 font-bold uppercase">{errors.approval_authority_designation}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetails;
