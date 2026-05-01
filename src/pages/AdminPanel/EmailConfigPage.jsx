import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEnvelope, FaSave, FaPlus, FaTrash, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const EmailConfigPage = () => {
  const [extraList, setExtraList] = useState(['']);
  const [isActive, setIsActive]   = useState(true);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [message, setMessage]     = useState({ type: '', text: '' });

  const token = () => localStorage.getItem('token');

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/email-config`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.data.data) {
        const d = res.data.data;
        setIsActive(d.is_active !== false);
        const emails = (d.extra_emails || '').split(',').map(e => e.trim()).filter(Boolean);
        setExtraList(emails.length ? emails : ['']);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load config: ' + (err.response?.data?.message || err.message) });
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setMessage({ type: '', text: '' });
    try {
      const validEmails = extraList.filter(e => e.trim() && e.includes('@'));
      await axios.post(`${baseUrl}/api/email-config`, {
        extra_emails: validEmails.join(','),
        is_active: isActive,
      }, { headers: { Authorization: `Bearer ${token()}` } });
      setMessage({ type: 'success', text: 'Email configuration saved successfully.' });
      fetchConfig();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save.' });
    } finally { setSaving(false); }
  };

  const addEmail    = () => setExtraList(p => [...p, '']);
  const removeEmail = (i) => setExtraList(p => p.filter((_, idx) => idx !== i));
  const updateEmail = (i, v) => setExtraList(p => p.map((e, idx) => idx === i ? v : e));

  if (loading) return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl p-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-xl w-1/2" />
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FaEnvelope className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-white font-black text-lg uppercase tracking-tight">Email Notifications</h1>
                <p className="text-blue-200 text-xs font-medium mt-0.5">Configure who receives enquiry alerts by email</p>
              </div>
            </div>
            <button
              onClick={() => setIsActive(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest transition-all ${
                isActive ? 'bg-green-400 text-green-900' : 'bg-white/20 text-white/70'
              }`}
            >
              {isActive ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
              {isActive ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-start gap-2 text-sm text-blue-700">
          <FaInfoCircle className="mt-0.5 shrink-0 text-blue-500" />
          <span>
            When any enquiry is submitted, a full-detail email is automatically sent to{' '}
            <strong>airambulance@flyolaindia.com</strong>, the <strong>DM / Collector</strong> of that district,
            and any extra emails added below.
          </span>
        </div>
      </div>

      {/* Alert */}
      {message.text && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.type === 'success' ? <FaCheckCircle className="shrink-0" /> : <FaExclamationTriangle className="shrink-0" />}
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto font-black opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Always-on recipients */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm mb-4 flex items-center gap-2">
          <span className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center text-white text-[10px]">✓</span>
          Always Notified (Auto)
        </h2>
        <div className="space-y-2">
          {[
            { label: 'Primary Notification Email', email: 'airambulance@flyolaindia.com', badge: 'Fixed' },
            { label: 'DM / Collector of Enquiry District', email: 'Auto-fetched from user accounts', badge: 'Auto' },
          ].map(r => (
            <div key={r.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{r.label}</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{r.email}</p>
              </div>
              <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                r.badge === 'Fixed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {r.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Extra emails */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm flex items-center gap-2">
            <span className="w-5 h-5 bg-orange-500 rounded-md flex items-center justify-center text-white text-[10px]">+</span>
            Extra Notification Emails
          </h2>
          <button
            onClick={addEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
          >
            <FaPlus className="text-[9px]" /> Add Email
          </button>
        </div>
        <p className="text-xs text-gray-400 font-medium mb-4">
          These emails receive a notification for every enquiry created, regardless of district.
        </p>

        <div className="space-y-3">
          {extraList.map((email, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={e => updateEmail(i, e.target.value)}
                  placeholder="example@domain.com"
                  className={`w-full pl-9 pr-4 py-2.5 border-2 rounded-xl text-sm font-medium focus:outline-none transition-all ${
                    email && !email.includes('@')
                      ? 'border-red-200 bg-red-50 focus:border-red-400'
                      : 'border-gray-100 focus:border-blue-500'
                  }`}
                />
              </div>
              <button
                onClick={() => removeEmail(i)}
                disabled={extraList.length === 1}
                className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all disabled:opacity-20 border border-red-100 hover:border-red-500"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))}
        </div>

        {extraList.some(e => e && !e.includes('@')) && (
          <p className="mt-2 text-[10px] text-red-500 font-bold flex items-center gap-1">
            <FaExclamationTriangle /> Invalid email addresses will be skipped on save
          </p>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
          ) : (
            <><FaSave /> Save Configuration</>
          )}
        </button>
      </div>
    </div>
  );
};

export default EmailConfigPage;
