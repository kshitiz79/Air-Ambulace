import React, { useState, useRef, useEffect } from 'react';
import { useReferralSearch } from '../../hooks/useReferralSearch';

/**
 * AuthoritySearchInput — searchable dropdown for referral authority master data.
 * Props:
 *   type          — 'PHYSICIAN' | 'RECOMMENDING' | 'APPROVAL'
 *   nameField     — formData field name for name
 *   designField   — formData field name for designation
 *   nameValue     — current name value
 *   designValue   — current designation value
 *   onSelect      — fn({ name, designation }) called when user picks from dropdown
 *   onNameChange  — raw onChange for name input (for manual typing)
 *   onDesignChange— raw onChange for designation input
 *   namePlaceholder
 *   designPlaceholder
 *   nameError
 *   designError
 *   inputClass    — tailwind classes for inputs
 */
const AuthoritySearchInput = ({
  type,
  nameField,
  designField,
  nameValue,
  designValue,
  onSelect,
  onNameChange,
  namePlaceholder = 'Search name...',
  designPlaceholder = 'Designation',
  nameError,
  designError,
  inputClass = 'w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-base',
}) => {
  const { results, loading, search, clear } = useReferralSearch(type);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNameInput = (e) => {
    // Synchronously update the parent state to clear designation when typing starts
    // Use the nameField and designField props to target the correct fields
    onSelect({ name: e.target.value, designation: '' });
    search(e.target.value);
    setOpen(true);
  };
  const handlePick = (item) => {
    onSelect({ name: item.name, designation: item.designation });
    setOpen(false);
    clear();
  };

  // On Blur: If the current name doesn't match what was selected, clear it
  // This ensures ONLY master data can be submitted
  const handleBlur = () => {
    // Small delay to allow onMouseDown of list items to trigger first
    setTimeout(() => {
      // Logic: If user typed something but didn't pick from list, 
      // or changed the text after picking, we revert if it doesn't match
      // For simplicity, we can trust that if designValue is present, it came from a pick.
      // If they change the name, we clear everything.
      if (!designValue) {
        onSelect({ name: '', designation: '' });
      }
      setOpen(false);
    }, 200);
  };

  return (
    <div className="space-y-3" ref={wrapRef}>
      {/* Name with dropdown */}
      <div className="relative">
        <input
          type="text"
          name={nameField}
          value={nameValue}
          onChange={handleNameInput}
          onBlur={handleBlur}
          onFocus={() => { search(nameValue || ''); setOpen(true); }}
          onClick={() => { if (!open) { search(nameValue || ''); setOpen(true); } }}
          placeholder={namePlaceholder}
          autoComplete="off"
          className={inputClass}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 animate-pulse">searching...</span>
        )}
        {open && results.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {results.map((item) => (
              <li
                key={item.id}
                onMouseDown={() => handlePick(item)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
              >
                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">{item.designation}</p>
              </li>
            ))}
          </ul>
        )}
        {nameError && <p className="text-red-400 text-[9px] mt-1 font-bold uppercase">{nameError}</p>}
      </div>

      {/* Designation — auto-filled and READ ONLY as per user request */}
      <div>
        <input
          type="text"
          name={designField}
          value={designValue}
          readOnly
          placeholder={designPlaceholder}
          className={`${inputClass.replace('font-bold text-base', 'font-semibold text-xs')} cursor-not-allowed opacity-80`}
        />
        {designError && <p className="text-red-400 text-[9px] mt-1 font-bold uppercase">{designError}</p>}
      </div>
    </div>
  );
};

export default AuthoritySearchInput;
