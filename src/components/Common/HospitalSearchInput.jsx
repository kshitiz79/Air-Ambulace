import React, { useState, useRef, useEffect, useCallback } from 'react';
import baseUrl from '../../baseUrl/baseUrl';

/**
 * HospitalSearchInput — searchable dropdown for hospitals.
 * If the hospital doesn't exist, the user can type a new name and it auto-creates in the DB.
 * Next time the dropdown opens, the new hospital will appear.
 *
 * Props:
 *   name          — form field name (e.g. 'hospital_id' or 'source_hospital_id')
 *   value         — current hospital_id value
 *   hospitals     — array of { hospital_id, name }
 *   onChange      — fn(e) — standard onChange handler, will receive { target: { name, value: hospital_id } }
 *   onHospitalCreated — fn() — called after a new hospital is created so parent can refresh list
 *   placeholder
 *   inputClass
 */
const HospitalSearchInput = ({
  name,
  value,
  hospitals = [],
  onChange,
  onHospitalCreated,
  placeholder = 'Search or type hospital name...',
  inputClass = 'w-full p-2.5 bg-gray-50/50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-sm',
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  const wrapRef = useRef(null);

  // Derive display name from current value
  useEffect(() => {
    if (value) {
      const match = hospitals.find(h => h.hospital_id?.toString() === value?.toString());
      if (match) {
        setQuery(match.name || match.hospital_name || '');
      }
    }
  }, [value, hospitals]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
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

  // Filter hospitals by query
  const filtered = hospitals.filter(h => {
    const hospitalName = (h.name || h.hospital_name || '').toLowerCase();
    return hospitalName.includes(query.toLowerCase());
  });

  const handleInput = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    // Clear current selection when typing
    if (value) {
      onChange({ target: { name, value: '' } });
    }
  };

  const handlePick = (hospital) => {
    setQuery(hospital.name || hospital.hospital_name || '');
    onChange({ target: { name, value: hospital.hospital_id.toString() } });
    setOpen(false);
  };

  // Auto-create new hospital
  const handleCreateNew = async () => {
    if (!query.trim()) return;

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/hospitals`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hospital_name: query.trim()
        })
      });
      const data = await res.json();
      if (data.data || data.hospital_id) {
        const newId = data.data?.hospital_id || data.hospital_id;
        // Select the newly created hospital
        onChange({ target: { name, value: newId.toString() } });
        setCreateSuccess(`✓ "${query.trim()}" added`);
        setOpen(false);
        // Tell parent to refresh hospital list
        if (onHospitalCreated) onHospitalCreated();
      }
    } catch (err) {
      console.error('Failed to create hospital:', err);
    } finally {
      setCreating(false);
    }
  };

  // Check if typed value exactly matches an existing hospital
  const exactMatch = hospitals.some(
    h => (h.name || h.hospital_name || '').toLowerCase() === query.toLowerCase()
  );
  const showAddNew = query.trim() && !value && !exactMatch && !createSuccess;

  return (
    <div className="relative" ref={wrapRef}>
      <input
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        onClick={() => { if (!open) setOpen(true); }}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClass}
      />

      {/* Dropdown */}
      {open && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((h) => (
              <li
                key={h.hospital_id}
                onMouseDown={() => handlePick(h)}
                className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${
                  value?.toString() === h.hospital_id?.toString() ? 'bg-blue-50 font-bold' : ''
                }`}
              >
                <p className="text-sm font-semibold text-gray-800">{h.name || h.hospital_name}</p>
                {h.district?.district_name && (
                  <p className="text-[10px] text-gray-400">{h.district.district_name}</p>
                )}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-xs text-gray-500 italic">
              No hospital found — type full name below and click add
            </li>
          )}
        </ul>
      )}

      {/* Add New button */}
      {showAddNew && (
        <button
          type="button"
          onClick={handleCreateNew}
          disabled={creating}
          className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-all disabled:opacity-50"
        >
          {creating ? (
            <>
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <span className="w-4 h-4 bg-blue-500 text-white rounded flex items-center justify-center text-[10px]">+</span>
              Add "{query}" as new hospital
            </>
          )}
        </button>
      )}

      {/* Success */}
      {createSuccess && (
        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-[10px] font-bold">
          {createSuccess}
        </div>
      )}
    </div>
  );
};

export default HospitalSearchInput;
