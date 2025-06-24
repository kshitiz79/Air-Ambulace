import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaArrowRight, FaUserCircle } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      console.log('Sending login request:', { username });
      const response = await fetch('https://api.ambulance.jetserveaviation.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.message || 'Invalid username or password.');
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!data.token || !data.role || !data.userId) {
        setErrorMessage('Invalid server response. Missing required fields.');
        return;
      }

      const normalizedRole = data.role.toUpperCase();

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', normalizedRole);
      localStorage.setItem('district_id', data.district_id ?? '');
      localStorage.setItem('userId', data.userId);

      console.log('Navigating to role:', normalizedRole);

      switch (normalizedRole) {
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
    <div
      className="relative min-h-screen bg-center bg-cover"
      style={{ backgroundImage: `url('/bg-image.png')` }}
    >
      <div className="absolute inset-0"></div>
      <div className="relative z-10 flex items-center justify-center h-full p-4">
        <div className="w-full max-w-md rounded-2xl p-8 items-center justify-center mt-40">
          <h2 className="text-3xl font-bold text-gray-100 text-start mb-1">Welcome Back</h2>
          <p className="text-start text-gray-100 mb-6">Log in to access your dashboard</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <FaUserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-50" />
              <input
                type="text"
                placeholder="User Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-white/40 bg-opacity-60 placeholder-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-50" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-white/40 bg-opacity-60 placeholder-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {errorMessage && (
              <p className="text-red-600 text-sm text-center animate-shake">{errorMessage}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-1/3 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition"
              >
                {isLoading ? 'Logging in...' : 'Login'} <FaArrowRight />
              </button>

              <div className="text-center justify-center mt-3">
                <span className="text-gray-100">Don't have an account? </span>
                <button
                  onClick={() => navigate('/signup')}
                  className="text-blue-100 font-semibold px-1 bg-blue-900 rounded-3xl"
                >
                  Sign up
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