import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/signup';
import Login from './components/login';
import Dashboard from './components/dashboard';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path='/dashboard' element={
          <ProtectedRoute>
          <Dashboard />
          </ProtectedRoute>
        }/>
        <Route path='/' element={
          <ProtectedRoute>
          <Dashboard />
          </ProtectedRoute>
        }/>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
