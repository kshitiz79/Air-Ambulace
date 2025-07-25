import React, { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaServer, 
  FaDatabase, 
  FaEnvelope,
  FaShieldAlt,
  
  FaGlobe,
  FaBell,
  FaKey,
  FaUsers,
  FaFileAlt,
  FaSave,
  FaUndo,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEdit,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const SystemSettings = () => {
  const styles = useThemeStyles();
  const [settings, setSettings] = useState({
    system: {
      siteName: 'Air Ambulance System',
      siteUrl: 'https://airamb.example.com',
      timezone: 'Asia/Kolkata',
      language: 'en',
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'INFO'
    },
    database: {
      host: 'localhost',
      port: '5432',
      name: 'air_ambulance_db',
      maxConnections: 100,
      connectionTimeout: 30,
      backupFrequency: 'daily',
      autoOptimize: true
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: 'system@airamb.com',
      smtpPassword: '••••••••',
      fromName: 'Air Ambulance System',
      fromEmail: 'noreply@airamb.com',
      enableTLS: true
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireSpecialChars: true,
      enableTwoFactor: false,
      ipWhitelist: '',
      enableFirewall: true,
      sslEnabled: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true,
      systemAlerts: true,
      userRegistration: true,
      enquiryUpdates: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      retentionDays: 30,
      compressionEnabled: true,
      encryptionEnabled: true,
      remoteBackup: false,
      backupLocation: '/var/backups/air_ambulance'
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('system');
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'system', label: 'System', icon: <FaServer /> },
    { id: 'database', label: 'Database', icon: <FaDatabase /> },
    { id: 'email', label: 'Email', icon: <FaEnvelope /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'backup', label: 'Backup', icon: <FaDatabase /> }
  ];

  const handleInputChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleToggle = (category, field) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real application, this would save to an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Settings saved successfully!');
      setHasChanges(false);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setHasChanges(false);
      setSuccess('Settings reset to defaults');
    }
  };

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Site Name
          </label>
          <input
            type="text"
            value={settings.system.siteName}
            onChange={(e) => handleInputChange('system', 'siteName', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Site URL
          </label>
          <input
            type="url"
            value={settings.system.siteUrl}
            onChange={(e) => handleInputChange('system', 'siteUrl', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Timezone
          </label>
          <select
            value={settings.system.timezone}
            onChange={(e) => handleInputChange('system', 'timezone', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Log Level
          </label>
          <select
            value={settings.system.logLevel}
            onChange={(e) => handleInputChange('system', 'logLevel', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          >
            <option value="DEBUG">DEBUG</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className={`font-medium ${styles.primaryText}`}>Maintenance Mode</h4>
            <p className={`text-sm ${styles.secondaryText}`}>Enable to put the system in maintenance mode</p>
          </div>
          <button
            onClick={() => handleToggle('system', 'maintenanceMode')}
            className={`text-2xl ${settings.system.maintenanceMode ? 'text-green-600' : 'text-gray-400'}`}
          >
            {settings.system.maintenanceMode ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className={`font-medium ${styles.primaryText}`}>Debug Mode</h4>
            <p className={`text-sm ${styles.secondaryText}`}>Enable detailed error logging and debugging</p>
          </div>
          <button
            onClick={() => handleToggle('system', 'debugMode')}
            className={`text-2xl ${settings.system.debugMode ? 'text-green-600' : 'text-gray-400'}`}
          >
            {settings.system.debugMode ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Database Host
          </label>
          <input
            type="text"
            value={settings.database.host}
            onChange={(e) => handleInputChange('database', 'host', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Port
          </label>
          <input
            type="number"
            value={settings.database.port}
            onChange={(e) => handleInputChange('database', 'port', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Database Name
          </label>
          <input
            type="text"
            value={settings.database.name}
            onChange={(e) => handleInputChange('database', 'name', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Max Connections
          </label>
          <input
            type="number"
            value={settings.database.maxConnections}
            onChange={(e) => handleInputChange('database', 'maxConnections', parseInt(e.target.value))}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Connection Timeout (seconds)
          </label>
          <input
            type="number"
            value={settings.database.connectionTimeout}
            onChange={(e) => handleInputChange('database', 'connectionTimeout', parseInt(e.target.value))}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Backup Frequency
          </label>
          <select
            value={settings.database.backupFrequency}
            onChange={(e) => handleInputChange('database', 'backupFrequency', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className={`font-medium ${styles.primaryText}`}>Auto Optimize</h4>
          <p className={`text-sm ${styles.secondaryText}`}>Automatically optimize database tables</p>
        </div>
        <button
          onClick={() => handleToggle('database', 'autoOptimize')}
          className={`text-2xl ${settings.database.autoOptimize ? 'text-green-600' : 'text-gray-400'}`}
        >
          {settings.database.autoOptimize ? <FaToggleOn /> : <FaToggleOff />}
        </button>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.email.smtpHost}
            onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            SMTP Port
          </label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => handleInputChange('email', 'smtpPort', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            SMTP Username
          </label>
          <input
            type="email"
            value={settings.email.smtpUser}
            onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            SMTP Password
          </label>
          <input
            type="password"
            value={settings.email.smtpPassword}
            onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            From Name
          </label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            From Email
          </label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className={`font-medium ${styles.primaryText}`}>Enable TLS</h4>
          <p className={`text-sm ${styles.secondaryText}`}>Use TLS encryption for email connections</p>
        </div>
        <button
          onClick={() => handleToggle('email', 'enableTLS')}
          className={`text-2xl ${settings.email.enableTLS ? 'text-green-600' : 'text-gray-400'}`}
        >
          {settings.email.enableTLS ? <FaToggleOn /> : <FaToggleOff />}
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Max Login Attempts
          </label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Password Min Length
          </label>
          <input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            IP Whitelist (comma separated)
          </label>
          <textarea
            value={settings.security.ipWhitelist}
            onChange={(e) => handleInputChange('security', 'ipWhitelist', e.target.value)}
            rows={3}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
            placeholder="192.168.1.1, 10.0.0.1"
          />
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'requireSpecialChars', label: 'Require Special Characters', desc: 'Passwords must contain special characters' },
          { key: 'enableTwoFactor', label: 'Two-Factor Authentication', desc: 'Enable 2FA for all users' },
          { key: 'enableFirewall', label: 'Enable Firewall', desc: 'Enable built-in firewall protection' },
          { key: 'sslEnabled', label: 'SSL Enabled', desc: 'Force HTTPS connections' }
        ].map(setting => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className={`font-medium ${styles.primaryText}`}>{setting.label}</h4>
              <p className={`text-sm ${styles.secondaryText}`}>{setting.desc}</p>
            </div>
            <button
              onClick={() => handleToggle('security', setting.key)}
              className={`text-2xl ${settings.security[setting.key] ? 'text-green-600' : 'text-gray-400'}`}
            >
              {settings.security[setting.key] ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {[
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send notifications via email' },
        { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send notifications via SMS' },
        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Send browser push notifications' },
        { key: 'adminAlerts', label: 'Admin Alerts', desc: 'Send alerts to administrators' },
        { key: 'systemAlerts', label: 'System Alerts', desc: 'Send system-level alerts' },
        { key: 'userRegistration', label: 'User Registration', desc: 'Notify on new user registrations' },
        { key: 'enquiryUpdates', label: 'Enquiry Updates', desc: 'Notify on enquiry status changes' }
      ].map(setting => (
        <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className={`font-medium ${styles.primaryText}`}>{setting.label}</h4>
            <p className={`text-sm ${styles.secondaryText}`}>{setting.desc}</p>
          </div>
          <button
            onClick={() => handleToggle('notifications', setting.key)}
            className={`text-2xl ${settings.notifications[setting.key] ? 'text-green-600' : 'text-gray-400'}`}
          >
            {settings.notifications[setting.key] ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </div>
      ))}
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Backup Frequency
          </label>
          <select
            value={settings.backup.backupFrequency}
            onChange={(e) => handleInputChange('backup', 'backupFrequency', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Backup Time
          </label>
          <input
            type="time"
            value={settings.backup.backupTime}
            onChange={(e) => handleInputChange('backup', 'backupTime', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Retention Days
          </label>
          <input
            type="number"
            value={settings.backup.retentionDays}
            onChange={(e) => handleInputChange('backup', 'retentionDays', parseInt(e.target.value))}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
            Backup Location
          </label>
          <input
            type="text"
            value={settings.backup.backupLocation}
            onChange={(e) => handleInputChange('backup', 'backupLocation', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
          />
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'autoBackup', label: 'Auto Backup', desc: 'Enable automatic backups' },
          { key: 'compressionEnabled', label: 'Compression', desc: 'Compress backup files' },
          { key: 'encryptionEnabled', label: 'Encryption', desc: 'Encrypt backup files' },
          { key: 'remoteBackup', label: 'Remote Backup', desc: 'Store backups remotely' }
        ].map(setting => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className={`font-medium ${styles.primaryText}`}>{setting.label}</h4>
              <p className={`text-sm ${styles.secondaryText}`}>{setting.desc}</p>
            </div>
            <button
              onClick={() => handleToggle('backup', setting.key)}
              className={`text-2xl ${settings.backup[setting.key] ? 'text-green-600' : 'text-gray-400'}`}
            >
              {settings.backup[setting.key] ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'system': return renderSystemSettings();
      case 'database': return renderDatabaseSettings();
      case 'email': return renderEmailSettings();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      case 'backup': return renderBackupSettings();
      default: return renderSystemSettings();
    }
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${styles.primaryText} flex items-center`}>
                <FaCog className="mr-3 text-gray-600" />
                System Settings
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>
                Configure system-wide settings and preferences
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <FaUndo className="mr-2" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !hasChanges}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <FaSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200 flex items-center">
          <FaCheckCircle className="mr-2" />
          {success}
        </div>
      )}

      {hasChanges && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-200 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          You have unsaved changes. Don't forget to save your settings.
        </div>
      )}

      {/* Settings Content */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        {/* Tabs */}
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings