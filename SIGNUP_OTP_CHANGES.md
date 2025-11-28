# SignUp OTP Implementation - Changes Made

## Overview
Updated the SignUp component to use OTP verification instead of direct registration.

## Changes Made

### 1. Frontend - `SignUp.jsx`

#### New State Variables
```javascript
const [otp, setOtp] = useState("");
const [showOtpInput, setShowOtpInput] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
```

#### New Functions
- **`handleSignUp(e)`** - Now sends OTP to email (Step 1)
  - Uploads profile pic if provided
  - Calls `/api/auth/send-registration-otp`
  - Shows OTP input field on success

- **`handleVerifyOTP(e)`** - Verifies OTP and completes registration (Step 2)
  - Validates 6-digit OTP
  - Calls `/api/auth/verify-registration-otp`
  - Stores token and navigates to dashboard

- **`handleResendOTP()`** - Resends OTP
  - Calls same send-otp endpoint
  - Clears previous OTP input

#### UI Changes
- **Initial Form**: Shows when `showOtpInput === false`
  - Profile photo selector
  - Full name, email, password fields
  - Admin invite token (optional, with helper text)
  - Button text: "SEND OTP"
  - All fields disabled during loading

- **OTP Verification Form**: Shows when `showOtpInput === true`
  - Displays email where OTP was sent
  - 6-digit OTP input (numeric only, max 6 chars)
  - "VERIFY OTP" button
  - "Resend OTP" button
  - "Change Email" button (goes back to first step)

### 2. Frontend - `apiPaths.js`

Added new API endpoints:
```javascript
AUTH: {
  SEND_REGISTRATION_OTP: '/api/auth/send-registration-otp',
  VERIFY_REGISTRATION_OTP: '/api/auth/verify-registration-otp',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  DELETE_ACCOUNT_REQUEST: '/api/auth/delete-account-request',
  CONFIRM_DELETE_ACCOUNT: '/api/auth/confirm-delete-account',
}
```

## User Flow

### Registration Process
1. User fills out signup form (name, email, password, optional admin token)
2. Clicks "SEND OTP" button
3. Backend validates:
   - Email is from private organization (blocks Gmail, Yahoo, Outlook, etc.)
   - Admin invite token if provided (wrong token = error, empty = member role)
4. OTP sent to email (beautiful HTML template with 6-digit code)
5. UI switches to OTP input screen
6. User enters 6-digit OTP
7. Clicks "VERIFY OTP" button
8. Backend validates OTP (max 5 attempts, 10-minute expiry)
9. User account created with `isEmailVerified: true`
10. JWT token issued and stored
11. Redirect to appropriate dashboard (admin/user)

### Key Features
- **Email Validation**: Only private organization emails allowed
- **Admin Token**: Wrong token = 401 error, empty = member role
- **OTP Security**: 6 digits, 10-minute expiry, max 5 attempts
- **User Experience**: 
  - Clear success/error messages
  - Loading states on all buttons
  - Ability to resend OTP
  - Ability to change email if wrong
  - Numeric-only OTP input with auto-length limit

## Testing Checklist

- [ ] Register with valid private email → Receive OTP email
- [ ] Enter correct OTP → Account created and logged in
- [ ] Enter wrong OTP → Error message shown
- [ ] Try 6 wrong OTPs → Account locked
- [ ] Wait 10+ minutes → OTP expired error
- [ ] Click "Resend OTP" → New OTP received
- [ ] Click "Change Email" → Return to signup form
- [ ] Try public email (Gmail) → 403 error "Only organization emails allowed"
- [ ] Wrong admin token → 401 error
- [ ] Empty admin token → Member role assigned
- [ ] Valid admin token → Admin role assigned

## Next Steps

1. **Test the Flow**: Start both backend and frontend, try registration
2. **Update Login** (if needed): Check if login needs email verification check
3. **Create Forgot Password UI**: Build password reset flow
4. **Create Account Deletion UI**: Add delete account option in profile settings
5. **Email Configuration**: Set up proper SMTP credentials in backend `.env`

## Email Configuration Required

Make sure these are set in `backend/.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@taskmanager.com
```

## Error Handling

All possible errors are now handled with clear messages:
- Network errors
- Invalid OTP
- Expired OTP
- Too many attempts
- Public email domain
- Invalid admin token
- Missing required fields
- Profile pic upload failures
