import React, { useState, useRef, useEffect } from 'react';
import { useReferralSearch } from '../../hooks/useReferralSearch';
import baseUrl from '../../baseUrl/baseUrl';

/**
 * AuthoritySearchInput — searchable dropdown for referral authority master data.
 * If the user types a name + designation that doesn't exist in the master,
 * they can click "Add New" to auto-create it in the referral authority master table.
 *
 * Props:
 *   type          — 'PHYSICIAN' | 'RECOMMENDING' | 'APPROVAL'
 *   nameField     — formData field name for name
 *   designField   — formData field name for designation
 *   nameValue     — current name value
 *   designValue   — current designation value
 *   onSelect      — fn({ name, designation }) called when user picks from dropdown
 *   onNameChange  — raw onChange for name input (for manual typing)
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
  namePlaceholder = 'Search or type name...',
  designPlaceholder = 'Designation',
  nameError,
  designError,
  inputClass = 'w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-base',
}) => {
  const { results, loading, search, clear } = useReferralSearch(type);
  const [open, setOpen] = useState(false);
  const [isFromMaster, setIsFromMaster] = useState(false); // Track if current value came from master
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  const wrapRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (createSuccess) {
      const timer = setTimeout(() => setCreateSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [createSuccess]);

  const handleNameInput = (e) => {
    setIsFromMaster(false);
    onSelect({ name: e.target.value, designation: '' });
    search(e.target.value);
    setOpen(true);
    setCreateSuccess('');
  };

  const handleDesignInput = (e) => {
    // Allow manual designation entry when typing a new authority
    onSelect({ name: nameValue, designation: e.target.value });
  };

  const handlePick = (item) => {
    onSelect({ name: item.name, designation: item.designation });
    setIsFromMaster(true);
    setOpen(false);
    clear();
  };

  // Auto-create new authority in master table
  const handleCreateNew = async () => {
    if (!nameValue?.trim() || !designValue?.trim()) return;
    
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/referral-authorities`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nameValue.trim(),
          designation: designValue.trim(),
          type: type
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsFromMaster(true);
        setCreateSuccess(`✓ "${nameValue.trim()}" added to master`);
      }
    } catch (err) {
      console.error('Failed to create referral authority:', err);
    } finally {
      setCreating(false);
    }
  };

  // Check if typed value matches any existing result
  const isExactMatch = results.some(
    r => r.name.toLowerCase() === (nameValue || '').toLowerCase()
  );

  // Determine if we should show the "Add New" button
  const showAddNew = nameValue?.trim() && designValue?.trim() && !isFromMaster && !isExactMatch && !createSuccess;

  return (
    <div className="space-y-3" ref={wrapRef}>
      {/* Name with dropdown */}
      <div className="relative">
        <input
          type="text"
          name={nameField}
          value={nameValue}
          onChange={handleNameInput}
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
        {/* Show "no results" hint when searching yields nothing */}
        {open && !loading && results.length === 0 && nameValue?.trim() && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
            <p className="text-xs text-gray-500 italic">No existing record found — type designation below and save as new</p>
          </div>
        )}
        {nameError && <p className="text-red-400 text-[9px] mt-1 font-bold uppercase">{nameError}</p>}
      </div>

      {/* Designation — editable for manual entry */}
      <div>
        <input
          type="text"
          name={designField}
          value={designValue}
          onChange={handleDesignInput}
          readOnly={isFromMaster}
          placeholder={designPlaceholder}
          className={`${inputClass.replace('font-bold text-base', 'font-semibold text-xs')} ${isFromMaster ? 'cursor-not-allowed opacity-80' : ''}`}
        />
        {designError && <p className="text-red-400 text-[9px] mt-1 font-bold uppercase">{designError}</p>}
      </div>

      {/* Add New button — appears when user typed a new name+designation not in master */}
      {showAddNew && (
        <button
          type="button"
          onClick={handleCreateNew}
          disabled={creating}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-all disabled:opacity-50"
        >
          {creating ? (
            <>
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <span className="w-4 h-4 bg-blue-500 text-white rounded flex items-center justify-center text-[10px]">+</span>
              Save "{nameValue}" to Master Database
            </>
          )}
        </button>
      )}

      {/* Success banner */}
      {createSuccess && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-[10px] font-bold">
          {createSuccess}
        </div>
      )}
    </div>
  );
};

export default AuthoritySearchInput;
