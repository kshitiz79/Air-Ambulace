import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaArrowRight, FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl.jsx';
import { AuthContext } from '../../Context/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useThemeStyles } from '../../hooks/useThemeStyles.js';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import ForceChangePasswordModal from '../../components/Common/ForceChangePasswordModal.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(60);
  const [pendingRedirect, setPendingRedirect] = useState(null); // route to go after forced change
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setErrorMessage('Your session has expired. Please log in again.');
      window.history.replaceState({}, '', '/sign-in');
    }
  }, [location]);

  useEffect(() => {
    let interval;
    if (step === 3 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const { isDark } = useTheme();
  const styles = useThemeStyles();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.message || 'Invalid username or password.');
        return;
      }

      const data = await response.json();
      if (!data.token || !data.role || !data.userId) {
        setErrorMessage('Invalid server response. Missing required fields.');
        return;
      }

      const userData = {
        userId: data.userId,
        role: data.role.toUpperCase(),
        full_name: data.full_name || 'Unknown',
      };
      
      login(userData, data.token);

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role.toUpperCase());
      localStorage.setItem('district_id', data.district_id ?? '');
      localStorage.setItem('district_name', data.district_name ?? '');
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('user_id', data.userId);
      localStorage.setItem('full_name', data.full_name || data.username || 'User');
      localStorage.setItem('username', data.username || '');
      localStorage.setItem('email', data.email || '');

      const roleRoutes = {
        BENEFICIARY: '/user', CMHO: '/cmho-dashboard', SDM: '/sdm-dashboard',
        ADMIN: '/admin', COLLECTOR: '/collector-dashboard', SERVICE_PROVIDER: '/air-team',
        SUPPORT: '/it-team', HOSPITAL: '/hospital-dashboard', DME: '/dme-dashboard',
      };
      const destination = roleRoutes[data.role.toUpperCase()];

      if (data.must_change_password) {
        // Store destination, show modal — don't navigate yet
        setPendingRedirect(destination || '/');
        return;
      }

      if (destination) {
        navigate(destination, { replace: true });
      } else {
        setErrorMessage('Role not recognized. Please contact support.');
      }
    } catch (err) {
      setErrorMessage('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('OTP sent successfully to your email');
        setStep(3); // Based on user instructions: Send is step 2, Verify is step 3
        setTimer(60);
      } else {
        setErrorMessage(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setErrorMessage('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join('') })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('OTP verified successfully');
        setStep(4);
      } else {
        setErrorMessage(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setErrorMessage('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('OTP resent successfully to your email');
        setTimer(60);
      } else {
        setErrorMessage(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setErrorMessage('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Password reset successfully! You can now login.');
        setTimeout(() => {
          setStep(1);
          setEmail('');
          setOtp(['', '', '', '', '', '']);
          setNewPassword('');
          setSuccessMessage('');
        }, 2000);
      } else {
        setErrorMessage(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setErrorMessage('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-center bg-cover"
      style={{ backgroundImage: `url('/bg-image2.png')` }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {pendingRedirect && (
        <ForceChangePasswordModal
          onSuccess={() => {
            setPendingRedirect(null);
            navigate(pendingRedirect, { replace: true });
          }}
        />
      )}

      {/* Center card — full screen on mobile, fixed box on desktop */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8 md:justify-start md:px-10">
        <div className="w-full max-w-sm md:max-w-md bg-white shadow-2xl rounded-2xl md:rounded-none p-8 md:p-12 flex flex-col justify-center">
          
          {step === 1 && (
            <>
              <h2 className={`text-3xl font-bold text-center mb-1 ${isDark ? 'text-slate-900' : 'text-gray-900'}`}>{t.welcomeBack || 'Welcome Back'}</h2>
              <p className={`text-center mb-6 ${isDark ? 'text-slate-900' : 'text-gray-900'}`}>{t.logInToAccess || 'Log in to access your dashboard'}</p>
              
          <form onSubmit={handleLogin} className="space-y-5">

  <div className="relative">
    <FaUserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" />

    <input
      type="email"
      placeholder={t.email || 'Email'}
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
      required
      className="w-full pl-12 pr-4 py-3 rounded-sm bg-white border border-gray-300 placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
    />
  </div>


  <div className="relative">
    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" />

    <input
      type={showPassword ? "text" : "password"}
      placeholder={t.password || 'Password'}
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
      required
      className="w-full pl-12 pr-12 py-3 rounded-sm bg-white border border-gray-300 placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
    />
    <button
      type="button"
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>


  {errorMessage && (
    <p className="text-red-600 text-sm text-center animate-shake">
      {errorMessage}
    </p>
  )}

  {successMessage && (
    <p className="text-green-600 text-sm text-center">
      {successMessage}
    </p>
  )}


  <div className="flex flex-col gap-2 pt-2">

    <button
      type="submit"
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-sm transition disabled:opacity-70 cursor-pointer"
    >
      {isLoading ? (t.loggingIn || 'Logging in...') : (t.login || 'Login')} <FaArrowRight />
    </button>



    

      <button
        type="button"
        onClick={() => {
          setStep(2);
          setErrorMessage('');
          setSuccessMessage('');
        }}
        className=" text-blue-600 hover:text-blue-800 px-3 py-1 rounded-sm transition-colors cursor-pointer"
      >
         {t.forgotPassword || 'Forgot Password?'}
      </button>



  </div>

</form>
            </>
          )}

          {step === 2 && (
        <form onSubmit={handleSendOtp} className="space-y-5">

  <h2 className="text-4xl font-bold text-center mb-6 text-gray-900">
    {t.resetPassword || 'Reset Password'}
  </h2>

  <p className="text-center text-sm mb-4 text-gray-700">
    {t.enterEmailForOtp || 'Enter your email address to receive an OTP'}
  </p>

  <div className="relative">
    <FaUserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" />

    <input
      type="email"
      placeholder={t.enterYourEmail || 'Enter your email'}
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
      required
      className="w-full pl-12 pr-4 py-3 rounded-sm bg-white border border-gray-300 placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
    />
  </div>

  {errorMessage && (
    <p className="text-red-500 text-sm text-center">
      {errorMessage}
    </p>
  )}

  {successMessage && (
    <p className="text-green-500 text-sm text-center">
      {successMessage}
    </p>
  )}

  <div className="flex flex-col gap-3">

    <button
      type="submit"
      disabled={isLoading}
      className="w-full bg-blue-500 hover:bg-blue-600 py-3 text-white font-semibold rounded-sm transition disabled:opacity-70"
    >
      {isLoading ? (t.sending || 'Sending...') : (t.sendOtp || 'Send OTP')}
    </button>

    <button
      type="button"
      onClick={() => {
        setStep(1);
        setErrorMessage('');
        setSuccessMessage('');
      }}
      className="w-full text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors mt-2"
    >
      {t.backToLogin || 'Back to Login'}
    </button>

  </div>

</form>
          )}

{step === 3 && (
<form onSubmit={handleVerifyOtp} className="flex flex-col items-center text-center space-y-6">

  <h2 className="text-4xl font-bold text-gray-900">
    {t.verifyYourEmail || 'Verify Your Email Address'}
  </h2>

  <p className="text-gray-500 text-lg">
    {t.sentCodeTo || 'We sent an activation authentication code to'}
    <br />
    <span className="text-blue-600 font-semibold">{email}</span>
  </p>

  {/* OTP BOXES */}
  <div className="flex gap-2 justify-center mt-4">
    {[...Array(6)].map((_, i) => (
      <input
        key={i}
        type="text"
        maxLength="1"
        className="w-10 h-10 md:w-14 md:h-14 border border-gray-300 rounded-lg text-center text-lg md:text-xl focus:ring-2 focus:ring-blue-500 outline-none"
        value={otp[i]}
        onChange={(e) => {
          const value = e.target.value;
          if (!/^[0-9]?$/.test(value)) return;

          const newOtp = [...otp];
          newOtp[i] = value;
          setOtp(newOtp);

          if (value && e.target.nextSibling) {
            e.target.nextSibling.focus();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !otp[i] && e.target.previousSibling) {
            e.target.previousSibling.focus();
          }
        }}
      />
    ))}
  </div>

  {errorMessage && (
    <p className="text-red-500 text-sm">{errorMessage}</p>
  )}

  {successMessage && (
    <p className="text-green-500 text-sm">{successMessage}</p>
  )}

  <p className="text-gray-500 text-sm">
    {t.wrongEmailAddress || 'Wrong email address?'}
    <button
      type="button"
      onClick={() => setStep(2)}
      className="text-blue-600 font-semibold"
    >
      {t.goBack || 'Go Back'}
    </button>
  </p>

  <p className="text-sm font-bold text-gray-400">
    {timer > 0 ? (
      `${t.resendCodeIn || 'Resend Code in'} 0:${timer.toString().padStart(2, '0')}`
    ) : (
      <span className="text-green-600">{t.canResendNow || 'You can resend now'}</span>
    )}
  </p>


  <button
    type="submit"
    disabled={isLoading}
    className="w-full max-w-md bg-gradient-to-r from-blue-500 to-blue-500 py-3 text-white font-semibold rounded-md"
  >
    {isLoading ? (t.verifying || 'Verifying...') : (t.verifyOtp || 'Verify OTP')}
  </button>

  <p className="text-gray-500 text-sm">
    {t.haventReceivedOtp || "Haven't received the OTP yet?"}
    <button 
      type="button"
      onClick={handleResendOtp}
      disabled={timer > 0 || isLoading}
      className={`font-semibold transition-colors ${timer > 0 || isLoading ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
    >
      {t.resendOtp || 'Resend OTP'}
    </button>
  </p>

</form>
)}

{step === 4 && (
<form onSubmit={handleResetPassword} className="flex flex-col items-center text-center space-y-2">

  <h2 className="text-4xl font-bold text-gray-900">
    {t.createNewPassword || 'Create new password'}
  </h2>

  <p className="text-gray-500 text-lg max-w-md">
    {t.newPasswordDifferent || 'Your new password must be different from previous used passwords.'}
  </p>

  {/* PASSWORD */}
  <div className="w-full max-w-md text-left">
    <label className="text-sm text-gray-500">{t.password || 'Password'}</label>

    <div className="relative mt-2">
      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type={showPassword ? "text" : "password"}
        placeholder={t.password || 'Password'}
        value={newPassword}
        onChange={(e)=>setNewPassword(e.target.value)}
        required
        minLength={8}
        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>

    <p className="text-sm text-gray-400 mt-1">
      {t.mustBeAtLeast8Chars || 'Must be at least 8 characters.'}
    </p>
  </div>

  {/* CONFIRM PASSWORD */}
  <div className="w-full max-w-md text-left">
    <label className="text-sm text-gray-500">{t.confirmPassword || 'Confirm Password'}</label>

    <div className="relative mt-2">
      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type={showConfirmPassword ? "text" : "password"}
        placeholder={t.confirmPassword || 'Confirm Password'}
        value={confirmPassword}
        onChange={(e)=>setConfirmPassword(e.target.value)}
        required
        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      >
        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>

    <p className="text-sm text-gray-400 mt-1">
      {t.passwordsMustMatch || 'Both passwords must match.'}
    </p>
  </div>

  {errorMessage && (
    <p className="text-red-500 text-sm">{errorMessage}</p>
  )}

  {successMessage && (
    <p className="text-green-500 text-sm">{successMessage}</p>
  )}

  <button
    type="submit"
    disabled={isLoading}
    className="w-full max-w-md bg-blue-500 hover:bg-blue-600 py-3 text-white font-semibold rounded-md"
  >
    {isLoading ? (t.resetting || "Resetting...") : (t.resetPassword || "Reset Password")}
  </button>

</form>
)}

        </div>
      </div>
    </div>
  );
};

export default Login;
