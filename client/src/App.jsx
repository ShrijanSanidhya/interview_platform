import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InterviewRoom from './pages/InterviewRoom';
import Summary from './pages/Summary';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/room/:id" 
        element={
          <ProtectedRoute>
            <InterviewRoom />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/summary/:id" 
        element={
          <ProtectedRoute>
            <Summary />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
