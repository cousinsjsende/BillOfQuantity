import React, { useState } from 'react';
import Logo from '../assets/images/logo.png'; 
import Image1 from '../assets/images/floor-plan-1857175_1280.jpg';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import { useAuth } from './AuthContext'; // Assuming this is where login context is defined
import { Link } from 'react-router-dom'; // Import Link for routing to signup page

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Assuming useAuth provides login functionality

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting login data:', formData);

    // Authentication API call
    fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            const errorMessage = data.non_field_errors
              ? data.non_field_errors.join(', ')
              : 'Invalid login credentials';
            throw new Error(errorMessage);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('User logged in:', data);
        setError('');
        login(data.token); // Call login with the received token
        navigate('/dashboard'); // Redirect to dashboard
      })
      .catch((error) => {
        console.error('Error:', error);
        setError(error.message);
      });
  };

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div
        className="relative w-[900px] h-[650px] bg-cover bg-center"
        style={{ backgroundImage: `url(${Image1})` }} 
      >
        {/* Pseudo element for the background image opacity */}
        <div
          className="absolute inset-0 bg-black opacity-60"
          style={{
            backgroundImage: `url(${Image1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1, // Ensures this layer is behind the inner content
          }}
        ></div>

        <div className="absolute inset-0 flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-xl text-center w-[400px] h-[450px] flex flex-col justify-top py-8 items-center">
            <img src={Logo} style={{ height: '60px', width: 'auto' }} alt="BQ ZIM Logo" className="mb-8" />

            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              {/* Username input */}
              <input
                type="text"
                id="username"
                placeholder="USERNAME"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Password input */}
              <input
                type="password"
                id="password"
                placeholder="PASSWORD"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Error message */}
              <div className="text-red-600 text-sm mb-4">{error}</div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                LOGIN
              </button>
            </form>

            {/* Link to Sign Up */}
            <div className="mt-4">
              <p className="text-sm text-white">
                Don’t have an account?{' '}
                <Link to="/signup" className="text-blue-400 underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
