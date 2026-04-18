import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Candidate' });
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email: formData.email, password: formData.password } : formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="neo-raised p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-[var(--color-on-background)]">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <div className="mb-4 text-red-500 text-center neo-inset p-3 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              value={formData.name} onChange={handleChange}
              className="neo-inset w-full p-4 text-[var(--color-on-background)] outline-none" required 
            />
          )}
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            value={formData.email} onChange={handleChange}
            className="neo-inset w-full p-4 text-[var(--color-on-background)] outline-none" required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} onChange={handleChange}
            className="neo-inset w-full p-4 text-[var(--color-on-background)] outline-none" required 
          />
          
          {!isLogin && (
            <select name="role" value={formData.role} onChange={handleChange} className="neo-inset w-full p-4 text-[var(--color-on-background)] outline-none cursor-pointer">
              <option value="Candidate">Candidate</option>
              <option value="Interviewer">Interviewer</option>
            </select>
          )}

          <button type="submit" className="neo-raised mt-4 p-4 text-center font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-focus)] active:neo-inset transition-all">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center text-[var(--color-on-surface-variant)]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[var(--color-primary)] font-semibold hover:underline">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
