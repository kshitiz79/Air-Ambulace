import React from 'react';
import AuthoritySearchInput from '../../../../components/Common/AuthoritySearchInput';

const ReferralDetails = ({ formData, handleChange, language, labels, errors }) => {
  // Called when user picks from dropdown — sets both name + designation in one go to avoid state race conditions
  const handleSelect = (nameField, designField) => ({ name, designation }) => {
    // We call handleChange once for each, but better yet, we can use a functional update if we had access to setFormData. 
    // Since we only have handleChange which calls setFormData({...formData, ...}), 
    // we should really have a way to update multiple.
    // However, a simple fix is to ensure the second call doesn't overwrite the first.
    // Instead of two handleChange calls, let's create a single update object if the parent supported it.
    // Given the current parent structure, I'll just trigger one then the other with the correct 'prev' logic if I could, but I can't.
    // Let's modify handleSelect to take advantage of the fact that handleChange is passed down.
    
    // I will modify EnquiryCreationPage to add a handleMultiChange.
    handleChange({ target: { name: 'MULTI_UPDATE_REFERRAL', value: { [nameField]: name, [designField]: designation } } });
  };

  const inputClass = 'w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-base';

  return (
    <div className="space-y-4">
      {/* Referring Physician */}
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
              <AuthoritySearchInput
                type="PHYSICIAN"
                nameField="referring_physician_name"
                designField="referring_physician_designation"
                nameValue={formData.referring_physician_name}
                designValue={formData.referring_physician_designation}
                onSelect={handleSelect('referring_physician_name', 'referring_physician_designation')}
                onNameChange={handleChange}
                namePlaceholder={labels[language].fullName}
                designPlaceholder={labels[language].designationRank}
                nameError={errors.referring_physician_name}
                designError={errors.referring_physician_designation}
                inputClass={inputClass}
              />
            </div>
            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-orange-600 italic">{labels[language].officialDirectives}</p>
              <textarea
                name="referral_note"
                value={formData.referral_note}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-blue-500 transition-all text-sm italic"
                placeholder={labels[language].internalNotes}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommending & Approval Authority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        {/* Recommending Authority */}
        <div className="space-y-3 p-3 bg-white rounded-xl border border-gray-50 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-[10px] uppercase">RA</div>
            <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-tight italic">{labels[language].recommendingAuthority}</h4>
          </div>
          <AuthoritySearchInput
            type="RECOMMENDING"
            nameField="recommending_authority_name"
            designField="recommending_authority_designation"
            nameValue={formData.recommending_authority_name}
            designValue={formData.recommending_authority_designation}
            onSelect={handleSelect('recommending_authority_name', 'recommending_authority_designation')}
            onNameChange={handleChange}
            namePlaceholder={labels[language].fullName}
            designPlaceholder={labels[language].designationRank}
            nameError={errors.recommending_authority_name}
            designError={errors.recommending_authority_designation}
            inputClass="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 transition-all font-bold text-sm bg-gray-50/20"
          />
        </div>

        {/* Approval Authority */}
        <div className="space-y-3 p-3 bg-white rounded-xl border border-gray-50 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-[10px] uppercase">AA</div>
            <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-tight italic">{labels[language].approvalAuthority}</h4>
          </div>
          <AuthoritySearchInput
            type="APPROVAL"
            nameField="approval_authority_name"
            designField="approval_authority_designation"
            nameValue={formData.approval_authority_name}
            designValue={formData.approval_authority_designation}
            onSelect={handleSelect('approval_authority_name', 'approval_authority_designation')}
            onNameChange={handleChange}
            namePlaceholder={labels[language].fullName}
            designPlaceholder={labels[language].designationRank}
            nameError={errors.approval_authority_name}
            designError={errors.approval_authority_designation}
            inputClass="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-green-500 transition-all font-bold text-sm bg-gray-50/20"
          />
        </div>
      </div>
    </div>
  );
};

export default ReferralDetails;
