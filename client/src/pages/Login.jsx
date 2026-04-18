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
      const res = await fetch(`http://localhost:5005${endpoint}`, {
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
    <div className="bg-surface text-on-surface font-body min-h-screen flex items-center justify-center p-6 antialiased">
      {/* Transactional Page Canvas: Navigation shell suppressed */}
      <main className="w-full max-w-md">
        {/* Main Neomorphic Card */}
        <div className="bg-surface rounded-[2rem] p-8 md:p-10 neo-raised relative overflow-hidden">
          {/* Subtle Decorative Element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          
          {/* Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface neo-raised mb-6">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>data_object</span>
            </div>
            <h1 className="font-headline text-3xl font-bold text-primary tracking-tight mb-2">SilkCode</h1>
            <p className="text-on-surface-variant text-sm font-medium">Neomorphic IDE Environment</p>
          </div>
          
          {/* Toggle Segmented Control */}
          <div className="flex p-1.5 bg-surface rounded-xl neo-pressed mb-8 relative z-10">
            <button 
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-surface neo-raised text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Log In
            </button>
            <button 
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-surface neo-raised text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Sign Up
            </button>
          </div>
          
          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            {error && <div className="text-center text-error font-medium">{error}</div>}
            
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1 uppercase tracking-wider">Full Name</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">person</span>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-surface text-sm font-medium text-on-surface placeholder-on-surface-variant/40 rounded-xl py-4 pl-12 pr-4 neo-pressed focus:outline-none focus:ring-0 border-transparent transition-all" 
                    placeholder="Enter full name" 
                    type="text" 
                    required 
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">mail</span>
                <input 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-surface text-sm font-medium text-on-surface placeholder-on-surface-variant/40 rounded-xl py-4 pl-12 pr-4 neo-pressed focus:outline-none focus:ring-0 border-transparent transition-all" 
                    placeholder="developer@silkcode.io" 
                    type="email" 
                    required 
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1 mr-1">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Password</label>
                {isLogin && <a className="text-xs font-semibold text-primary hover:text-tertiary transition-colors" href="#">Forgot Password?</a>}
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">lock</span>
                <input 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-surface text-sm font-medium text-on-surface placeholder-on-surface-variant/40 rounded-xl py-4 pl-12 pr-12 neo-pressed focus:outline-none focus:ring-0 border-transparent transition-all" 
                    placeholder="••••••••••••" 
                    type="password" 
                    required 
                />
                <button className="absolute right-4 text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center" type="button">
                  <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1 uppercase tracking-wider">Role</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">badge</span>
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-surface text-sm font-medium text-on-surface placeholder-on-surface-variant/40 rounded-xl py-4 pl-12 pr-4 neo-pressed focus:outline-none focus:ring-0 border-transparent transition-all appearance-none cursor-pointer"
                  >
                     <option value="Candidate">Candidate</option>
                     <option value="Interviewer">Interviewer</option>
                  </select>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button className="mt-4 w-full bg-surface text-primary font-bold rounded-xl py-4 flex items-center justify-center gap-2 neo-raised active:neo-pressed transition-all duration-200 group" type="submit">
              {isLogin ? 'Enter Sandbox' : 'Create Sandbox Account'}
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>
          
          {/* Social Login Divider */}
          {isLogin && (
            <>
              <div className="mt-10 mb-8 flex items-center gap-4 relative z-10">
                <div className="flex-1 h-px bg-surface-variant shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"></div>
                <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Or continue with</span>
                <div className="flex-1 h-px bg-surface-variant shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"></div>
              </div>
              
              <div className="flex justify-center gap-6 relative z-10">
                <button type="button" className="w-14 h-14 rounded-full bg-surface flex items-center justify-center neo-raised active:neo-pressed transition-all text-on-surface-variant hover:text-on-surface group">
                  <img alt="Google" className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlSB9M3WpBZwoLGxQRzlgA2SuJNfcORMMdOyID03GuQeYK1RYYTW7oiRyd7-CO_XxKiXOfc_9Rw0jWso-ascxZEgpahgClKObCxhJkZj6dOmaPMb_hI7BbfomlM7HkIUBkcx7GOc8X1yuP8oBkv4jcVnISPSzWMDtgvhmEK8SeMs_VYXSV-xUfB3XSv2MnPAakR-Anz6eDDADw2gHeIrHot7FuquKeYx51xUmNEB30uWrulIn-L-WnnfEkQWk6XhZqBMUXQr8JeRU"/>
                </button>
                <button type="button" className="w-14 h-14 rounded-full bg-surface flex items-center justify-center neo-raised active:neo-pressed transition-all text-on-surface-variant hover:text-on-surface">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
