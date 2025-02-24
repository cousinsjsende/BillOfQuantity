import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../assets/images/logo.png';
import Image1 from '../assets/images/floor-plan-1857175_1280.jpg';

const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting signup data:', formData);

    fetch('http://127.0.0.1:8000/api/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            const errorMessage = data.email
              ? data.email.join(', ')
              : data.username
              ? data.username.join(', ')
              : 'There was an error signing up';
            throw new Error(errorMessage);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('User signed up:', data);
        setError('');
        navigate('/login'); // Redirect to the Login page on success
      })
      .catch((error) => {
        console.error('Error:', error);
        setError(error.message);
      });
  };

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div
        className="relative w-[900px] h-[800px] bg-cover bg-center"
        style={{ backgroundImage: `url(${Image1})` }}
      >
        {/* Pseudo element for the background image opacity */}
        <div
          className="absolute inset-0 bg-black opacity-60"
          style={{
            backgroundImage: `url(${Image1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1,
          }}
        ></div>

        <div className="absolute inset-0 flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-xl text-center w-[400px] h-[700px] flex flex-col justify-center py-8 items-center">
            <img src={Logo} style={{ height: '60px', width: 'auto' }} alt="BQ ZIM Logo" className="mb-8" />

            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <p className="mb-4 text-xl font-bold text-white">Create an account</p>

              {/* First Name input */}
              <input
                type="text"
                id="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Last Name input */}
              <input
                type="text"
                id="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Email input */}
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Username input */}
              <input
                type="text"
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Password input */}
              <input
                type="password"
                id="password"
                placeholder="Password"
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
                Sign Up
              </button>
            </form>

            {/* Link to Login */}
            <div className="mt-4">
              <p className="text-sm text-white">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
