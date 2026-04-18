import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[var(--color-background)] text-[var(--color-on-background)] font-sans">
      <h1 className="text-5xl font-bold mb-6 tracking-tight">CodeSync Interview Platform</h1>
      <p className="text-xl mb-12 text-[var(--color-on-surface-variant)] max-w-2xl">
        A premium, real-time code collaboration platform for technical interviews.
        Experience a neomorphic, deeply tactile environment optimized for focus.
      </p>
      
      <div className="flex gap-6">
        <button 
          onClick={() => navigate('/login')}
          className="neo-raised px-8 py-4 text-lg font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-focus)] transition-all active:neo-inset"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Landing;
