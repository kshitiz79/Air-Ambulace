"use client"
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('district_id', data.district_id);
        localStorage.setItem('userId', data.userId);

        switch (data.role) {
          case 'BENEFICIARY':
            navigate('/user');
            break;
          case 'CMO':
            navigate('/cmo-dashboard');
            break;
          case 'SDM':
            navigate('/sdm-dashboard');
            break;
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'DM':
            navigate('/dm-dashboard');
            break;
          case 'SERVICE_PROVIDER':
            navigate('/air-team');
            break;
          default:
            setErrorMessage('Role not recognized. Please contact support.');
        }
      } else {
        setErrorMessage(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      setErrorMessage('Server error. Please try again later.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 p-6">
      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-transform hover:scale-105">
       
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300 ease-in-out"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white text-xl font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
          >
            Login
          </button>
        </form>
        {errorMessage && (
          <p className="text-red-600 text-sm mt-4 animate-shake">{errorMessage}</p>
        )}
        <p className="mt-6 text-gray-700 text-center">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="text-purple-600 font-semibold cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
