import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DeleteAccountModal from '../../components/DeleteAccountModal';
import { MdEmail, MdPerson, MdSecurity, MdDelete, MdAdminPanelSettings, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import { useProfileEdit } from '../../hooks/useProfileEdit';

const AdminSettings = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Use shared profile editing hook
  const {
    user,
    isEditMode,
    isLoading,
    editName,
    setEditName,
    profilePicPreview,
    startEditing,
    handleUpdateProfile,
    handleCancelEdit,
    handleProfilePicChange,
  } = useProfileEdit();

  return (
    <DashboardLayout>
      <div className='max-w-4xl mx-auto p-6'>
        <div className='flex items-center mb-2'>
          <MdAdminPanelSettings className='text-4xl text-primary mr-3' />
          <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>Admin Settings</h1>
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400 mb-8'>Manage your admin account preferences and security</p>

        {/* Profile Information */}
        <div className='bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-6 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center'>
              <MdPerson className='text-2xl text-primary mr-3' />
              <h2 className='text-xl font-semibold text-gray-800 dark:text-white'>Profile Information</h2>
            </div>
            {!isEditMode ? (
              <button
                onClick={startEditing}
                className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
              >
                <MdEdit /> Edit Profile
              </button>
            ) : (
              <div className='flex gap-2'>
                <button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50'
                >
                  <MdSave /> {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className='flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium disabled:opacity-50'
                >
                  <MdCancel /> Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className='space-y-4'>
            {isEditMode ? (
              <div className='space-y-4'>
                <div className='flex flex-col items-center mb-4'>
                  <ProfilePhotoSelector 
                    image={null} 
                    setImage={handleProfilePicChange}
                    currentImage={profilePicPreview || user?.profileImageUrl}
                  />
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>Click to change profile picture</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Full Name</label>
                  <input
                    type='text'
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className='w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                    placeholder='Enter your name'
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div className='flex items-center'>
                <div className='w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-primary mr-6'>
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.name} 
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-3xl font-bold text-white'>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Full Name</p>
                  <p className='text-lg font-medium text-gray-800 dark:text-white'>{user?.name}</p>
                </div>
              </div>
            )}

            <div className='border-t dark:border-gray-700 pt-4'>
              <div className='flex items-center mb-2'>
                <MdEmail className='text-gray-500 dark:text-gray-400 mr-2' />
                <p className='text-sm text-gray-500 dark:text-gray-400'>Email Address</p>
              </div>
              <p className='text-base text-gray-800 dark:text-white ml-6'>{user?.email}</p>
              {user?.isEmailVerified && (
                <span className='inline-block ml-6 mt-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded'>
                  ✓ Verified
                </span>
              )}
            </div>

            <div className='border-t dark:border-gray-700 pt-4'>
              <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>Role</p>
              <span className='inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-300'>
                👑 Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className='bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-6 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center mb-6'>
            <MdSecurity className='text-2xl text-primary mr-3' />
            <h2 className='text-xl font-semibold text-gray-800 dark:text-white'>Security</h2>
          </div>
          
          <div className='space-y-4'>
            <div className='border-b dark:border-gray-700 pb-4'>
              <p className='text-base font-medium text-gray-800 dark:text-white mb-1'>Password</p>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>Keep your admin account secure with a strong password</p>
              <a 
                href='/forgot-password'
                className='inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
              >
                Change Password
              </a>
            </div>

            <div>
              <p className='text-base font-medium text-gray-800 dark:text-white mb-1'>Account Status</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Your account is currently <strong>{user?.accountStatus || 'active'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className='bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6'>
          <div className='flex items-center mb-3'>
            <MdAdminPanelSettings className='text-2xl text-blue-600 dark:text-blue-400 mr-2' />
            <h3 className='text-lg font-semibold text-blue-800 dark:text-blue-300'>Administrator Privileges</h3>
          </div>
          <p className='text-sm text-blue-700 dark:text-blue-300/80'>
            As an administrator, you have full access to manage users, tasks, and system settings. Please use your privileges responsibly.
          </p>
        </div>

        {/* Danger Zone */}
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6'>
          <div className='flex items-center mb-4'>
            <MdDelete className='text-2xl text-red-600 dark:text-red-400 mr-3' />
            <h2 className='text-xl font-semibold text-red-800 dark:text-red-300'>Danger Zone</h2>
          </div>
          
          <div className='space-y-3'>
            <p className='text-sm text-red-700 dark:text-red-400 font-medium'>Delete Admin Account</p>
            <p className='text-sm text-red-600 dark:text-red-400/80'>
              ⚠️ <strong>Warning:</strong> Deleting your admin account will permanently remove all your data and revoke your administrative privileges. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium mt-2'
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
      />
    </DashboardLayout>
  );
};

export default AdminSettings;
