import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    district_id: '',
  });
  const [districts, setDistricts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Fetch districts on mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/districts');
        const data = await response.json();
        setDistricts(data);
      } catch (error) {
        console.error('Failed to fetch districts:', error);
        setErrorMessage('Could not fetch districts. Please try again later.');
      }
    };
    fetchDistricts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors
    try {
      const res = await fetch('http://localhost:4000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'BENEFICIARY' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Signup failed');
        return;
      }

      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      setErrorMessage('Server error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl text-center w-full max-w-md">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Beneficiary Signup</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
            />
          </div>
          <div className="mb-5">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
            />
          </div>
          <div className="mb-5">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
            />
          </div>
          <div className="mb-5">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
            />
          </div>
          <div className="mb-6">
            <select
              name="district_id"
              value={formData.district_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out bg-white appearance-none" // appearance-none to remove default arrow on some browsers
            >
              <option value="" disabled>Select District</option>
              {districts.length > 0 ? (
                districts.map((dist) => (
                  <option key={dist.district_id} value={dist.district_id}>
                    {dist.district_name} {dist.pincode ? `(${dist.pincode})` : ''}
                  </option>
                ))
              ) : (
                <option disabled>Loading districts...</option>
              )}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-bold text-xl rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
          >
            Sign Up
          </button>
        </form>
        {errorMessage && (
          <p className="text-red-600 text-sm mt-5">{errorMessage}</p>
        )}
        <p className="mt-6 text-gray-600 text-base">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;