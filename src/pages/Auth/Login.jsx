import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaArrowRight, FaUserCircle, FaSun, FaMoon } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';
import { AuthContext } from '../../Context/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const styles = useThemeStyles();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      console.log('Sending login request:', { email });
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
      console.log('Login response:', data);

      if (!data.token || !data.role || !data.userId) {
        setErrorMessage('Invalid server response. Missing required fields.');
        return;
      }

      const userData = {
        userId: data.userId,
        role: data.role.toUpperCase(),
        full_name: data.full_name || 'Unknown',
      };
      console.log('Storing user data:', userData);
      login(userData, data.token);

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role.toUpperCase());
      localStorage.setItem('district_id', data.district_id ?? '');
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('full_name', data.full_name || data.username || 'User');
      localStorage.setItem('username', data.username || '');
      localStorage.setItem('email', data.email || '');

      console.log('Navigating to role:', data.role.toUpperCase());
      switch (data.role.toUpperCase()) {
        case 'BENEFICIARY':
          navigate('/user', { replace: true });
          break;
        case 'CMO':
          navigate('/cmo-dashboard', { replace: true });
          break;
        case 'SDM':
          navigate('/sdm-dashboard', { replace: true });
          break;
        case 'ADMIN':
          navigate('/admin', { replace: true });
          break;
        case 'DM':
          navigate('/dm-dashboard', { replace: true });
          break;
        case 'SERVICE_PROVIDER':
          navigate('/air-team', { replace: true });
          break;
        case 'SUPPORT':
          navigate('/it-team', { replace: true });
          break;
        case 'HOSPITAL':
          navigate('/hospital-dashboard', { replace: true });
          break;
        default:
          setErrorMessage('Role not recognized. Please contact support.');
          break;
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-center bg-cover'
    }`} style={!isDark ? { backgroundImage: `url('/bg-image.png')` } : {}}>
      {!isDark && <div className="absolute inset-0 bg-black/20"></div>}
      
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full transition-all duration-200 ${
            isDark 
              ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
              : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
          }`}
          title="Toggle theme"
        >
          {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-center h-full p-4">
        <div className={`w-full max-w-md rounded-2xl p-8 items-center justify-center mt-40 ${
          isDark 
            ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
            : 'bg-white/10 backdrop-blur-sm'
        }`}>
          <h2 className={`text-3xl font-bold text-start mb-1 ${
            isDark ? 'text-slate-100' : 'text-gray-100'
          }`}>Welcome Back</h2>
          <p className={`text-start mb-6 ${
            isDark ? 'text-slate-300' : 'text-gray-100'
          }`}>Log in to access your dashboard</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <FaUserCircle className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-gray-50'
              }`} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
                  isDark 
                    ? 'bg-slate-700/80 text-slate-100 placeholder-slate-400 border border-slate-600' 
                    : 'bg-white/40 bg-opacity-60 placeholder-gray-100 text-white'
                }`}
              />
            </div>
            <div className="relative">
              <FaLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-gray-50'
              }`} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
                  isDark 
                    ? 'bg-slate-700/80 text-slate-100 placeholder-slate-400 border border-slate-600' 
                    : 'bg-white/40 bg-opacity-60 placeholder-gray-100 text-white'
                }`}
              />
            </div>
            {errorMessage && <p className="text-red-600 text-sm text-center animate-shake">{errorMessage}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-1/3 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition"
              >
                {isLoading ? 'Logging in...' : 'Login'} <FaArrowRight />
              </button>
              <div className="text-center justify-center mt-3">
                <span className={isDark ? 'text-slate-300' : 'text-gray-100'}>Forgot Password </span>
                <button className={`font-semibold px-3 py-1 rounded-full transition-colors ${
                  isDark 
                    ? 'text-blue-400 bg-slate-700 hover:bg-slate-600' 
                    : 'text-blue-100 bg-blue-900 hover:bg-blue-800'
                }`}>
                  Click me
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;