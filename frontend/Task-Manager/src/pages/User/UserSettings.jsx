import React, { useState, useContext } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { UserContext } from '../../context/userContext';
import DeleteAccountModal from '../../components/DeleteAccountModal';
import { MdEmail, MdPerson, MdSecurity, MdDelete, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import uploadImage from '../../utils/uploadImage';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import toast from 'react-hot-toast';

const UserSettings = () => {
  const { user, updateUser } = useContext(UserContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsLoading(true);

    try {
      let profileImageUrl = user?.profileImageUrl || '';
      
      // Upload new profile picture if selected
      if (editProfilePic) {
        try {
          const imgUploadRes = await uploadImage(editProfilePic);
          profileImageUrl = imgUploadRes.imageUrl || '';
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast.error('Image upload failed. Updating name only.');
          // Continue with name update even if image upload fails
        }
      }

      // Update user profile
      const userId = user.id || user._id;
      const response = await axiosInstance.put(API_PATHS.USERS.UPDATE_USER(userId), {
        name: editName,
        profileImageUrl,
      });

      // Update context with new user data
      updateUser({ ...user, name: editName, profileImageUrl });
      
      toast.success('Profile updated successfully!');
      setIsEditMode(false);
      setEditProfilePic(null);
      setProfilePicPreview(null);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditName(user?.name || '');
    setEditProfilePic(null);
    setProfilePicPreview(null);
    setIsEditMode(false);
  };

  // Handle profile pic change
  const handleProfilePicChange = (file) => {
    setEditProfilePic(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePicPreview(null);
    }
  };

  return (
    <DashboardLayout>
      <div className='max-w-4xl mx-auto p-6'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Account Settings</h1>
        <p className='text-sm text-gray-600 mb-8'>Manage your account preferences and security</p>

        {/* Profile Information */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center'>
              <MdPerson className='text-2xl text-primary mr-3' />
              <h2 className='text-xl font-semibold text-gray-800'>Profile Information</h2>
            </div>
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
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
                    image={editProfilePic} 
                    setImage={handleProfilePicChange}
                    currentImage={profilePicPreview || user?.profileImageUrl}
                  />
                  <p className='text-xs text-gray-500 mt-2'>Click to change profile picture</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
                  <input
                    type='text'
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                    placeholder='Enter your name'
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div className='flex items-center'>
                <div className='w-24 h-24 rounded-full overflow-hidden bg-gray-200 mr-6'>
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.name} 
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500'>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Full Name</p>
                  <p className='text-lg font-medium text-gray-800'>{user?.name}</p>
                </div>
              </div>
            )}

            <div className='border-t pt-4'>
              <div className='flex items-center mb-2'>
                <MdEmail className='text-gray-500 mr-2' />
                <p className='text-sm text-gray-500'>Email Address</p>
              </div>
              <p className='text-base text-gray-800 ml-6'>{user?.email}</p>
              {user?.isEmailVerified && (
                <span className='inline-block ml-6 mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>
                  ✓ Verified
                </span>
              )}
            </div>

            <div className='border-t pt-4'>
              <p className='text-sm text-gray-500 mb-2'>Role</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role === 'admin' ? '👑 Admin' : '👤 Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div className='flex items-center mb-6'>
            <MdSecurity className='text-2xl text-primary mr-3' />
            <h2 className='text-xl font-semibold text-gray-800'>Security</h2>
          </div>
          
          <div className='space-y-4'>
            <div className='border-b pb-4'>
              <p className='text-base font-medium text-gray-800 mb-1'>Password</p>
              <p className='text-sm text-gray-600 mb-3'>Keep your account secure with a strong password</p>
              <a 
                href='/forgot-password'
                className='inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
              >
                Change Password
              </a>
            </div>

            <div>
              <p className='text-base font-medium text-gray-800 mb-1'>Account Status</p>
              <p className='text-sm text-gray-600'>
                Your account is currently <strong>{user?.accountStatus || 'active'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
          <div className='flex items-center mb-4'>
            <MdDelete className='text-2xl text-red-600 mr-3' />
            <h2 className='text-xl font-semibold text-red-800'>Danger Zone</h2>
          </div>
          
          <div className='space-y-3'>
            <p className='text-sm text-red-700 font-medium'>Delete Account</p>
            <p className='text-sm text-red-600'>
              Once you delete your account, there is no going back. This action will permanently remove all your data, including tasks, profile information, and activity history.
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

export default UserSettings;
