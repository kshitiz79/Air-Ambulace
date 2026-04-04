import React, { useState, useEffect, useRef } from 'react';
import { restrictedChange } from '../../../../utils/restrictInput';
import baseUrl from '../../../../baseUrl/baseUrl';

const langProps = (language) => language === 'hi'
  ? { lang: 'hi', style: { fontFamily: "'Noto Sans Devanagari', sans-serif" } }
  : {};

const MedicalDetails = ({ formData, handleChange, language, labels, errors }) => {
  const rc = restrictedChange(handleChange, language);
  const [conditions, setConditions] = useState([]);
  const [query, setQuery] = useState(formData.medical_condition || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const wrapperRef = useRef(null);

  // Load master conditions once
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${baseUrl}/api/medical-conditions?active=true`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setConditions(d.data || []); })
      .catch(() => {});
  }, []);

  // Sync query if formData resets
  useEffect(() => {
    setQuery(formData.medical_condition || '');
  }, [formData.medical_condition]);

  // Filter suggestions as user types
  useEffect(() => {
    if (!query.trim() || conditions.length === 0) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = conditions.filter(c => {
      const name = language === 'hi' && c.name_hi ? c.name_hi : c.name;
      return name.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    }).slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setActiveSuggestion(-1);
  }, [query, conditions, language]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    // Also update formData so validation works
    handleChange({ target: { name: 'medical_condition', value: e.target.value } });
    setShowSuggestions(true);
  };

  const handleSelect = (condition) => {
    const displayName = language === 'hi' && condition.name_hi ? condition.name_hi : condition.name;
    setQuery(displayName);
    handleChange({ target: { name: 'medical_condition', value: displayName } });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getCategoryColor = (category) => {
    const map = {
      Cardiac: 'bg-red-100 text-red-700',
      Neurological: 'bg-purple-100 text-purple-700',
      Trauma: 'bg-orange-100 text-orange-700',
      Respiratory: 'bg-blue-100 text-blue-700',
      Obstetric: 'bg-pink-100 text-pink-700',
      Pediatric: 'bg-yellow-100 text-yellow-700',
      Renal: 'bg-teal-100 text-teal-700',
      Oncology: 'bg-gray-100 text-gray-700',
      Other: 'bg-green-100 text-green-700',
    };
    return map[category] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2 px-1">
        <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
        <h3 className="text-lg font-black text-gray-900 tracking-tight">{labels[language].clinicalAssessment}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Medical Condition — Search Autocomplete */}
        <div className="md:col-span-2" ref={wrapperRef}>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest italic">
            {labels[language].medicalCondition}
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => query.trim() && suggestions.length > 0 && setShowSuggestions(true)}
              autoComplete="off"
              {...langProps(language)}
              placeholder={language === 'hi' ? 'बीमारी खोजें या टाइप करें...' : 'Search or type medical condition...'}
              className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/20 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-50 transition-all text-sm font-medium shadow-sm pr-10"
            />
            {/* Search icon */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
              🔍
            </span>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                {suggestions.map((c, i) => {
                  const displayName = language === 'hi' && c.name_hi ? c.name_hi : c.name;
                  const altName = language === 'hi' && c.name_hi ? c.name : null;
                  return (
                    <div
                      key={c.id}
                      onMouseDown={() => handleSelect(c)}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                        i === activeSuggestion ? 'bg-red-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800" {...(language === 'hi' ? langProps('hi') : {})}>
                          {displayName}
                        </p>
                        {altName && (
                          <p className="text-xs text-gray-400 mt-0.5">{altName}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-3 shrink-0 ${getCategoryColor(c.category)}`}>
                        {c.category}
                      </span>
                    </div>
                  );
                })}
                <div className="px-4 py-2 bg-gray-50 text-[10px] text-gray-400 font-medium">
                  {language === 'hi' ? 'या ऊपर अपनी स्थिति टाइप करें' : 'Or keep typing your own condition above'}
                </div>
              </div>
            )}
          </div>
          {errors.medical_condition && (
            <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.medical_condition}</p>
          )}
        </div>

        {formData.air_transport_type !== 'Paid' && (
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
        )}

        {formData.air_transport_type !== 'Paid' && (
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
        )}

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
