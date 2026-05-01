import React, { useState, useEffect, useRef } from 'react';
import { restrictedChange } from '../../../../utils/restrictInput';
import baseUrl from '../../../../baseUrl/baseUrl';

const langProps = (language) => language === 'hi'
  ? { lang: 'hi', style: { fontFamily: "'Noto Sans Devanagari', sans-serif" } }
  : {};

const CATEGORY_COLORS = {
  Cardiac:       'bg-red-100 text-red-700',
  Neurological:  'bg-purple-100 text-purple-700',
  Trauma:        'bg-orange-100 text-orange-700',
  Respiratory:   'bg-blue-100 text-blue-700',
  Obstetric:     'bg-pink-100 text-pink-700',
  Pediatric:     'bg-yellow-100 text-yellow-700',
  Renal:         'bg-teal-100 text-teal-700',
  Oncology:      'bg-gray-100 text-gray-700',
  Other:         'bg-green-100 text-green-700',
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

const MedicalDetails = ({ formData, handleChange, language, labels, errors }) => {
  const rc = restrictedChange(handleChange, language);

  // ── Autocomplete state ──────────────────────────────────────────────────────
  const [conditions, setConditions]         = useState([]);
  const [query, setQuery]                   = useState(formData.medical_condition || '');
  const [suggestions, setSuggestions]       = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isFromMaster, setIsFromMaster]     = useState(false);

  // ── Inline-add state ────────────────────────────────────────────────────────
  const [showAddPanel, setShowAddPanel]     = useState(false);
  const [newCategory, setNewCategory]       = useState('Other');
  const [creating, setCreating]             = useState(false);
  const [createSuccess, setCreateSuccess]   = useState('');
  const [createError, setCreateError]       = useState('');

  const wrapperRef = useRef(null);

  // Load master conditions
  const loadConditions = () => {
    const token = localStorage.getItem('token');
    fetch(`${baseUrl}/api/medical-conditions?active=true`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setConditions(d.data || []); })
      .catch(() => {});
  };

  useEffect(() => { loadConditions(); }, []);

  // Sync query on form reset
  useEffect(() => { setQuery(formData.medical_condition || ''); }, [formData.medical_condition]);

  // Filter suggestions
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
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

  // Clear success after 3s
  useEffect(() => {
    if (createSuccess) {
      const t = setTimeout(() => setCreateSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [createSuccess]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsFromMaster(false);
    handleChange({ target: { name: 'medical_condition', value: val } });
    setShowSuggestions(true);
    setShowAddPanel(false);
    setCreateSuccess('');
  };

  const handleSelect = (condition) => {
    const displayName = language === 'hi' && condition.name_hi ? condition.name_hi : condition.name;
    setQuery(displayName);
    handleChange({ target: { name: 'medical_condition', value: displayName } });
    setIsFromMaster(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setShowAddPanel(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(p => Math.min(p + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(p => Math.max(p - 1, 0)); }
    else if (e.key === 'Enter' && activeSuggestion >= 0) { e.preventDefault(); handleSelect(suggestions[activeSuggestion]); }
    else if (e.key === 'Escape') { setShowSuggestions(false); }
  };

  // Check if typed value exactly matches any master entry
  const isExactMatch = conditions.some(c => c.name.toLowerCase() === query.trim().toLowerCase());

  // Show "Add to DB" button when: has text, not from master, no exact match, no success yet
  const showAddBtn = query.trim().length > 2 && !isFromMaster && !isExactMatch && !createSuccess;

  // Create new condition in DB
  const handleCreateNew = async () => {
    if (!query.trim()) return;
    setCreating(true); setCreateError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/medical-conditions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: query.trim(), category: newCategory }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateSuccess(`✓ "${query.trim()}" added to Medical Condition master`);
        setIsFromMaster(true);
        setShowAddPanel(false);
        loadConditions(); // refresh list
      } else {
        setCreateError(data.message || 'Failed to create');
      }
    } catch (e) {
      setCreateError('Network error — please try again');
    } finally { setCreating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2 px-1">
        <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
        <h3 className="text-lg font-black text-gray-900 tracking-tight">{labels[language].clinicalAssessment}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Medical Condition ─────────────────────────────────────────────── */}
        <div className="md:col-span-2" ref={wrapperRef}>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest italic">
            {labels[language].medicalCondition} <span className="text-red-500">*</span>
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
              className={`w-full p-4 border-2 rounded-2xl bg-gray-50/20 focus:bg-white focus:ring-2 transition-all text-sm font-medium shadow-sm pr-10 ${
                errors.medical_condition
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                  : isFromMaster
                    ? 'border-green-300 focus:border-green-400 focus:ring-green-50'
                    : 'border-gray-100 focus:border-red-500 focus:ring-red-50'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
              {isFromMaster ? '✅' : '🔍'}
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
                        {altName && <p className="text-xs text-gray-400 mt-0.5">{altName}</p>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-3 shrink-0 ${CATEGORY_COLORS[c.category] || 'bg-gray-100 text-gray-600'}`}>
                        {c.category}
                      </span>
                    </div>
                  );
                })}
                {/* "Not found" footer with add option */}
                <div
                  className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors"
                  onMouseDown={() => { setShowSuggestions(false); setShowAddPanel(true); }}
                >
                  <span className="text-[10px] text-gray-400 font-medium italic">
                    {language === 'hi' ? 'या नई बीमारी जोड़ें' : 'Not in list? Add new condition →'}
                  </span>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Add</span>
                </div>
              </div>
            )}

            {/* No results — show add hint */}
            {showSuggestions && suggestions.length === 0 && query.trim() && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                <div
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors"
                  onMouseDown={() => { setShowSuggestions(false); setShowAddPanel(true); }}
                >
                  <div>
                    <p className="text-xs font-bold text-gray-700">No match found for "{query}"</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 italic">Click to add it to the master database</p>
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">+ Add New</span>
                </div>
              </div>
            )}
          </div>

          {errors.medical_condition && (
            <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><span>⚠</span>{errors.medical_condition}</p>
          )}

          {/* ── Inline Add Panel ─────────────────────────────────────────── */}
          {showAddBtn && !showAddPanel && (
            <button
              type="button"
              onClick={() => setShowAddPanel(true)}
              className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-all"
            >
              <span className="w-4 h-4 bg-blue-500 text-white rounded flex items-center justify-center text-[10px]">+</span>
              Save "{query.trim()}" to Medical Condition Master
            </button>
          )}

          {showAddPanel && (
            <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
                  Add "{query.trim()}" to Master Database
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddPanel(false)}
                  className="text-blue-400 hover:text-blue-700 font-black text-sm"
                >✕</button>
              </div>

              {/* Category picker */}
              <div>
                <label className="block text-[9px] font-black text-blue-700 uppercase tracking-widest mb-2">
                  Select Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black border-2 transition-all ${
                        newCategory === cat
                          ? `${CATEGORY_COLORS[cat]} border-current scale-105 shadow-sm`
                          : 'bg-white text-gray-400 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {createError && (
                <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><span>⚠</span>{createError}</p>
              )}

              <button
                type="button"
                onClick={handleCreateNew}
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50"
              >
                {creating ? (
                  <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving to Database...</>
                ) : (
                  <>+ Add "{query.trim()}" as {newCategory}</>
                )}
              </button>
            </div>
          )}

          {/* Success banner */}
          {createSuccess && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl text-[10px] font-bold">
              {createSuccess}
            </div>
          )}
        </div>

        {/* ── Chief Complaint ───────────────────────────────────────────────── */}
        {formData.air_transport_type !== 'Paid' && (
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest italic">
              {labels[language].chiefComplaint} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="chief_complaint"
              value={formData.chief_complaint}
              onChange={rc}
              rows={2}
              {...langProps(language)}
              className={`w-full p-4 border-2 rounded-2xl bg-gray-50/20 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium ${errors.chief_complaint ? 'border-red-300 bg-red-50/30' : 'border-gray-50'}`}
            />
            {errors.chief_complaint && <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><span>⚠</span>{errors.chief_complaint}</p>}
          </div>
        )}

        {/* ── General Condition ─────────────────────────────────────────────── */}
        {formData.air_transport_type !== 'Paid' && (
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest italic">
              {labels[language].generalCondition} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="general_condition"
              value={formData.general_condition}
              onChange={rc}
              {...langProps(language)}
              className={`w-full p-3 border-2 rounded-xl focus:border-blue-500 transition-all font-bold bg-white text-sm ${errors.general_condition ? 'border-red-300 bg-red-50/30' : 'border-gray-100'}`}
              placeholder={language === 'hi' ? 'जैसे गंभीर लेकिन स्थिर' : 'e.g. Critical but stable'}
            />
            {errors.general_condition && <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><span>⚠</span>{errors.general_condition}</p>}
          </div>
        )}

        {/* ── Vitals ────────────────────────────────────────────────────────── */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest italic">
            {labels[language].vitals} <span className="text-red-500">*</span>
          </label>
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
          {errors.vitals && <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><span>⚠</span>{errors.vitals}</p>}
        </div>

      </div>
    </div>
  );
};

export default MedicalDetails;
