import React, { useState } from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, {
        email,
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

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        email,
        otp,
        newPassword,
      });

      setSuccessMessage(response.data.message || 'Password reset successful!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to reset password. Please try again.');
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
      const response = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, {
        email,
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

  return (
    <AuthLayout>
      <div className='lg:w-[80%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-bold'>Reset Your Password</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>
          {step === 1 
            ? 'Enter your email address to receive an OTP' 
            : 'Enter the OTP sent to your email and create a new password'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label='Email Address'
              placeholder='john@example.com'
              type='email'
              disabled={isLoading}
            />

            {error && <p className='text-red-500 text-xs pb-2.5 mt-2'>{error}</p>}
            {successMessage && <p className='text-green-500 text-xs pb-2.5 mt-2'>{successMessage}</p>}

            <button type='submit' className='btn-primary' disabled={isLoading}>
              {isLoading ? 'SENDING OTP...' : 'SEND OTP'}
            </button>

            <p className='text-[13px] text-slate-700 mt-3'>
              Remember your password?{" "}
              <Link className='font-medium text-primary underline' to='/login'>
                Log In
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className='mb-4'>
              <p className='text-sm text-slate-600 mb-4'>
                We've sent a 6-digit OTP to <strong>{email}</strong>
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
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                label='New Password'
                placeholder='Min 6 Characters'
                type='password'
                disabled={isLoading}
              />
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                label='Confirm Password'
                placeholder='Re-enter Password'
                type='password'
                disabled={isLoading}
              />
            </div>

            {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}
            {successMessage && <p className='text-green-500 text-xs pb-2.5'>{successMessage}</p>}

            <button type='submit' className='btn-primary mb-3' disabled={isLoading}>
              {isLoading ? 'RESETTING PASSWORD...' : 'RESET PASSWORD'}
            </button>

            <div className='flex items-center justify-between mb-3'>
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
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                  setSuccessMessage('');
                }}
                className='text-sm text-slate-600 underline'
                disabled={isLoading}
              >
                Change Email
              </button>
            </div>

            <p className='text-[13px] text-slate-700'>
              Remember your password?{" "}
              <Link className='font-medium text-primary underline' to='/login'>
                Log In
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
