import React, { useState, useContext } from 'react';
import Modal from './Modal';
import Input from './Inputs/Input';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { UserContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Confirm & Send OTP, 2: Verify OTP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Step 1: Request account deletion and send OTP
  const handleRequestDeletion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!password) {
      setError('Please enter your password to confirm');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.DELETE_ACCOUNT_REQUEST, {
        password,
      });

      setSuccessMessage(response.data.message || 'OTP sent to your email!');
      setStep(2);
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Confirm deletion with OTP
  const handleConfirmDeletion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.CONFIRM_DELETE_ACCOUNT, {
        otp,
      });

      setSuccessMessage(response.data.message || 'Account deleted successfully!');
      
      // Clear user data and redirect after 1.5 seconds
      setTimeout(() => {
        clearUser();
        navigate('/signup');
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to delete account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.DELETE_ACCOUNT_REQUEST, {
        password,
      });

      setSuccessMessage(response.data.message || 'OTP resent successfully!');
      setOtp('');
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset modal state when closing
  const handleClose = () => {
    setPassword('');
    setOtp('');
    setStep(1);
    setError('');
    setSuccessMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className='p-6'>
        <h2 className='text-2xl font-bold text-red-600 mb-4'>
          {step === 1 ? 'Delete Account' : 'Confirm Account Deletion'}
        </h2>
        
        {step === 1 ? (
          <>
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6'>
              <p className='text-sm text-red-800 dark:text-red-300 font-semibold mb-2'>⚠️ Warning: This action cannot be undone!</p>
              <p className='text-sm text-red-700 dark:text-red-400'>
                Deleting your account will permanently remove:
              </p>
              <ul className='text-sm text-red-700 dark:text-red-400 list-disc list-inside mt-2 space-y-1'>
                <li>Your profile and personal information</li>
                <li>All your tasks and assignments</li>
                <li>Your activity history and progress</li>
                <li>Access to this account</li>
              </ul>
            </div>

            <form onSubmit={handleRequestDeletion}>
              <p className='text-sm text-slate-700 dark:text-gray-300 mb-4'>
                Please enter your password to confirm account deletion. We'll send an OTP to <strong>{user?.email}</strong> for final verification.
              </p>

              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label='Enter Your Password'
                placeholder='Your password'
                type='password'
                disabled={isLoading}
              />

              {error && <p className='text-red-500 text-xs pb-2.5 mt-2'>{error}</p>}
              {successMessage && <p className='text-green-500 text-xs pb-2.5 mt-2'>{successMessage}</p>}

              <div className='flex gap-3 mt-6'>
                <button
                  type='button'
                  onClick={handleClose}
                  className='flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium'
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className='bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6'>
              <p className='text-sm text-orange-800 dark:text-orange-300 font-semibold mb-2'>🔒 Final Verification Required</p>
              <p className='text-sm text-orange-700 dark:text-orange-400'>
                We've sent a 6-digit OTP to your email. Enter it below to permanently delete your account.
              </p>
            </div>

            <form onSubmit={handleConfirmDeletion}>
              <p className='text-sm text-slate-700 dark:text-gray-300 mb-4'>
                OTP sent to <strong>{user?.email}</strong>
              </p>

              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                label='Enter OTP'
                placeholder='000000'
                type='text'
                maxLength={6}
                disabled={isLoading}
              />

              {error && <p className='text-red-500 text-xs pb-2.5 mt-2'>{error}</p>}
              {successMessage && <p className='text-green-500 text-xs pb-2.5 mt-2'>{successMessage}</p>}

              <div className='flex items-center justify-between mb-4 mt-3'>
                <button
                  type='button'
                  onClick={handleResendOTP}
                  className='text-sm text-primary underline'
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className='text-sm text-slate-600 dark:text-gray-400 underline'
                  disabled={isLoading}
                >
                  Go Back
                </button>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type='button'
                  onClick={handleClose}
                  className='flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium'
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium'
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting Account...' : 'Confirm Deletion'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;
