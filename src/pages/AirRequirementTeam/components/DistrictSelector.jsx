import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import baseUrl from '../../../baseUrl/baseUrl';

const DistrictSelector = ({ value, onChange, disabled = false }) => {
  const [districts, setDistricts] = useState([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/api/districts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setDistricts(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error('Failed to fetch districts:', err);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = districts.filter(d => {
    const q = query.toLowerCase();
    return d.district_name?.toLowerCase().includes(q) ||
      d.state?.toLowerCase().includes(q) ||
      d.division?.toLowerCase().includes(q);
  }).slice(0, 15);

  const selected = districts.find(d => d.district_name === value);

  if (disabled && selected) {
    return (
      <div className="w-full flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed">
        <span className="text-xs font-medium text-gray-700">{selected.district_name}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 border-2 border-gray-200 rounded-xl bg-white cursor-pointer hover:border-indigo-400 transition-all">
        {selected ? (
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900">{selected.district_name}</p>
            <p className="text-[9px] text-gray-500">{selected.state}</p>
          </div>
        ) : <span className="text-gray-400 text-xs">Select district...</span>}
        <FiSearch className="text-gray-400 shrink-0 ml-2" size={12} />
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={11} />
              <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search districts..."
                className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-indigo-400 focus:outline-none" />
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-center text-gray-400 text-xs py-3">No districts found</p>
              : filtered.map(district => (
                <div key={district.district_id}
                  onMouseDown={() => { onChange(district.district_name); setQuery(''); setOpen(false); }}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-indigo-50 border-b border-gray-50 last:border-0 ${value === district.district_name ? 'bg-indigo-50' : ''}`}>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">{district.district_name}</p>
                    <p className="text-[9px] text-gray-500">{district.state} • {district.division || 'No Division'}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictSelector;