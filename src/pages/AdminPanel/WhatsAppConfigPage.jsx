import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaWhatsapp, FaSave, FaFlask, FaToggleOn, FaToggleOff,
  FaKey, FaPhone, FaPlus, FaTrash, FaInfoCircle, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const WhatsAppConfigPage = () => {
  const styles = useThemeStyles();
  const [config, setConfig] = useState({
    account_sid: '',
    auth_token: '',
    from_number: '',
    extra_numbers: '',
    is_active: true,
  });
  const [extraList, setExtraList] = useState(['']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = () => localStorage.getItem('token');

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/whatsapp-config`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.data.data) {
        const d = res.data.data;
        setConfig({
          account_sid: d.account_sid || '',
          auth_token: d.auth_token || '',
          from_number: d.from_number || '',
          extra_numbers: d.extra_numbers || '',
          is_active: d.is_active !== false,
        });
        const extras = (d.extra_numbers || '').split(',').map(n => n.trim()).filter(Boolean);
        setExtraList(extras.length ? extras : ['']);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load config: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.account_sid || !config.from_number) {
      setMessage({ type: 'error', text: 'Account SID and From Number are required.' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        ...config,
        extra_numbers: extraList.filter(Boolean).join(','),
      };
      await axios.post(`${baseUrl}/api/whatsapp-config`, payload, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setMessage({ type: 'success', text: 'WhatsApp configuration saved successfully.' });
      fetchConfig();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save config.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testNumber) {
      setMessage({ type: 'error', text: 'Enter a test number first.' });
      return;
    }
    setTesting(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.post(`${baseUrl}/api/whatsapp-config/test`, { test_number: testNumber }, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setMessage({ type: 'success', text: `Test message sent to ${testNumber}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const addExtra = () => setExtraList(prev => [...prev, '']);
  const removeExtra = (i) => setExtraList(prev => prev.filter((_, idx) => idx !== i));
  const updateExtra = (i, val) => setExtraList(prev => prev.map((n, idx) => idx === i ? val : n));

  if (loading) return (
    <div className={`max-w-3xl mx-auto p-6 ${styles.pageBackground}`}>
      <div className={`${styles.cardBackground} rounded-lg p-8 animate-pulse`}>
        <div className={`h-8 ${styles.loadingShimmer} rounded mb-4`}></div>
        <div className={`h-48 ${styles.loadingShimmer} rounded`}></div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-3xl mx-auto p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6`}>
        <div className={`px-6 py-5 border-b ${styles.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaWhatsapp className="text-green-600 text-xl" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${styles.primaryText}`}>WhatsApp Notifications</h1>
                <p className={`text-sm ${styles.secondaryText}`}>Configure Twilio WhatsApp alerts for enquiry events</p>
              </div>
            </div>
            <button
              onClick={() => setConfig(c => ({ ...c, is_active: !c.is_active }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                config.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {config.is_active ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
              {config.is_active ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-start gap-2 text-sm text-blue-700">
          <FaInfoCircle className="mt-0.5 shrink-0" />
          <span>
            When an enquiry is created, WhatsApp messages are sent to: the CMHO who created it, the Collector of that district, and any extra numbers configured below.
            Requires a <strong>Twilio account</strong> with WhatsApp sandbox or approved sender.
          </span>
        </div>
      </div>

      {/* Alert */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          {message.text}
        </div>
      )}

      {/* Twilio Credentials */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
        <h2 className={`text-lg font-semibold ${styles.primaryText} mb-4 flex items-center gap-2`}>
          <FaKey className="text-blue-500" /> Twilio Credentials
        </h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Account SID *</label>
            <input
              type="text"
              value={config.account_sid}
              onChange={e => setConfig(c => ({ ...c, account_sid: e.target.value }))}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className={`w-full p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${styles.inputBackground}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Auth Token *</label>
            <input
              type="password"
              value={config.auth_token}
              onChange={e => setConfig(c => ({ ...c, auth_token: e.target.value }))}
              placeholder="Enter new token (leave blank to keep existing)"
              className={`w-full p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${styles.inputBackground}`}
            />
            <p className={`text-xs mt-1 ${styles.secondaryText}`}>Stored securely. Displayed masked after save.</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>From Number (WhatsApp Sender) *</label>
            <input
              type="text"
              value={config.from_number}
              onChange={e => setConfig(c => ({ ...c, from_number: e.target.value }))}
              placeholder="+14155238886"
              className={`w-full p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${styles.inputBackground}`}
            />
            <p className={`text-xs mt-1 ${styles.secondaryText}`}>Twilio sandbox number or approved WhatsApp Business number in E.164 format.</p>
          </div>
        </div>
      </div>

      {/* Extra Numbers */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${styles.primaryText} flex items-center gap-2`}>
            <FaPhone className="text-green-500" /> Extra Notify Numbers
          </h2>
          <button
            onClick={addExtra}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            <FaPlus /> Add Number
          </button>
        </div>
        <p className={`text-sm ${styles.secondaryText} mb-4`}>
          These numbers always receive a WhatsApp notification when any enquiry is created (in addition to the CMHO and Collector).
        </p>
        <div className="space-y-3">
          {extraList.map((num, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={num}
                onChange={e => updateExtra(i, e.target.value)}
                placeholder="+919876543210"
                className={`flex-1 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${styles.inputBackground}`}
              />
              <button
                onClick={() => removeExtra(i)}
                disabled={extraList.length === 1}
                className="p-2 text-red-500 hover:text-red-700 disabled:opacity-30"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Test Message */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
        <h2 className={`text-lg font-semibold ${styles.primaryText} mb-4 flex items-center gap-2`}>
          <FaFlask className="text-purple-500" /> Send Test Message
        </h2>
        <p className={`text-sm ${styles.secondaryText} mb-3`}>
          Send a test WhatsApp message to verify your Twilio configuration is working.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={testNumber}
            onChange={e => setTestNumber(e.target.value)}
            placeholder="+919876543210"
            className={`flex-1 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${styles.inputBackground}`}
          />
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            <FaFlask />
            {testing ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          <FaSave />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default WhatsAppConfigPage;
