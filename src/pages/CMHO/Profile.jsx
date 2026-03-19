import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileInformation from '../../components/Profile/ProfileInformation';
import AccountDetails from '../../components/Profile/AccountDetails';
import SecuritySection from '../../components/Profile/SecuritySection';
import AlertMessages from '../../components/Profile/AlertMessages';
import LoadingProfile from '../../components/Profile/LoadingProfile';

const Profile = () => {
  const {
    user,
    isEditing,
    loading,
    saving,
    error,
    success,
    showPasswordChange,
    passwordData,
    showPasswords,
    setShowPasswordChange,
    handleInputChange,
    handlePasswordChange,
    togglePasswordVisibility,
    handleSaveProfile,
    handleChangePassword,
    handleCancelPasswordChange,
    handleEdit,
    handleCancel,
    formatDate,
    getRoleBadgeColor
  } = useProfile();

  if (loading) {
    return <LoadingProfile />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <ProfileHeader
        user={user}
        isEditing={isEditing}
        saving={saving}
        onEdit={handleEdit}
        onSave={handleSaveProfile}
        onCancel={handleCancel}
        getRoleBadgeColor={getRoleBadgeColor}
      />

      <AlertMessages error={error} success={success} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileInformation
          user={user}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />

        <div className="space-y-6">
          <AccountDetails
            user={user}
            getRoleBadgeColor={getRoleBadgeColor}
            formatDate={formatDate}
          />

          <SecuritySection
            showPasswordChange={showPasswordChange}
            setShowPasswordChange={setShowPasswordChange}
            passwordData={passwordData}
            showPasswords={showPasswords}
            saving={saving}
            onPasswordChange={handlePasswordChange}
            onTogglePasswordVisibility={togglePasswordVisibility}
            onChangePassword={handleChangePassword}
            onCancelPasswordChange={handleCancelPasswordChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;