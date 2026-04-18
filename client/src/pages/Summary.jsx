import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Summary = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col font-body">
      {/* TopNavBar */}
      <header className="w-full h-18 sticky top-0 z-30 bg-background/80 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-b border-surface-container/20 flex justify-between items-center px-8 max-w-full py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-primary font-semibold flex items-center gap-2 hover:bg-surface/40 rounded-full p-2 transition-all duration-300 ease-in-out">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Dashboard</span>
          </button>
        </div>
        <div className="text-xl font-bold text-primary tracking-tight font-headline">SilkCode</div>
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:bg-surface/40 rounded-full p-2 transition-all duration-300 ease-in-out">
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
          <div className="w-10 h-10 rounded-full neo-raised overflow-hidden border-2 border-background">
            <img alt="Interviewer Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWOkXkMmwVU-VuSvRuXiu6kNvCA-itPQxWMy_jRJQ_J58RxHbumhUMYosDzNIdmIBeE-B7rcfPWiexyv4m156qGEwyN37nkGptAkkSOXmZA7VCCLER1hHeR4U_QjMLGTV13T0E73XSTDSWGJ6mENtk3FkB5SxXUvbF5CuUzuiIP3wWbjQhrkSWvkfHbYg1dvJJ1Q_CElvNC25YGx9OMGWw5ZDDzQphG3ydZ-pTQfh08DxiKr5MZBilpXEl6DA8vdlw-casjesi6u8"/>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-on-surface mb-2 font-headline">Interview Summary</h1>
          <p className="text-on-surface-variant text-lg">Senior Frontend Developer Role - Algorithm Challenge (Room {id?.substring(0,8).toUpperCase()})</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Status Card (Success/Failure) */}
          <div className="md:col-span-2 neo-raised bg-surface rounded-xl p-8 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Subtle decorative background element */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="w-32 h-32 rounded-full neo-inset flex items-center justify-center mb-6 bg-surface">
              <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            
            <h2 className="text-3xl font-bold text-on-surface mb-2 font-headline">Assessment Passed</h2>
            <p className="text-on-surface-variant text-center max-w-md mb-8">Excellent performance! The candidate demonstrated strong problem-solving skills and code efficiency.</p>
            
            <div className="flex gap-4 w-full justify-center">
              <button className="neo-raised bg-surface text-primary font-semibold py-3 px-8 rounded-xl active:neo-inset transition-all duration-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                View Code
              </button>
              <button className="neo-raised bg-surface text-primary font-semibold py-3 px-8 rounded-xl active:neo-inset transition-all duration-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">share</span>
                Share Report
              </button>
            </div>
          </div>

          {/* Stats Column */}
          <div className="flex flex-col gap-8 md:col-span-1">
            {/* Time Taken Card */}
            <div className="neo-raised bg-surface rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant mb-1 uppercase tracking-wider">Time Taken</p>
                <p className="text-3xl font-bold text-on-surface font-headline">42:15</p>
                <p className="text-xs text-secondary mt-1">out of 60:00 limit</p>
              </div>
              <div className="w-16 h-16 rounded-full neo-inset flex items-center justify-center bg-surface">
                <span className="material-symbols-outlined text-tertiary text-3xl">timer</span>
              </div>
            </div>

            {/* Test Cases Card */}
            <div className="neo-raised bg-surface rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant mb-1 uppercase tracking-wider">Test Cases</p>
                <p className="text-3xl font-bold text-on-surface font-headline">15/15</p>
                <p className="text-xs text-primary mt-1 font-medium">100% Passed</p>
              </div>
              <div className="w-16 h-16 rounded-full neo-inset flex items-center justify-center bg-surface">
                <span className="material-symbols-outlined text-primary text-3xl">fact_check</span>
              </div>
            </div>

            {/* Complexity Card */}
            <div className="neo-raised bg-surface rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant mb-1 uppercase tracking-wider">Complexity</p>
                <p className="text-xl font-bold text-on-surface font-headline">O(n log n)</p>
                <p className="text-xs text-secondary mt-1">Optimal solution</p>
              </div>
              <div className="w-16 h-16 rounded-full neo-inset flex items-center justify-center bg-surface">
                <span className="material-symbols-outlined text-on-surface-variant text-3xl">memory</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-background flex flex-col md:flex-row justify-between items-center px-12 border-t border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] mt-auto">
        <div className="text-xs text-slate-500 font-['Plus_Jakarta_Sans'] mb-4 md:mb-0">
          © 2024 SilkCode Real-time IDE. Neomorphic Edition.
        </div>
        <div className="flex gap-6 text-xs text-slate-500 font-['Plus_Jakarta_Sans']">
          <a className="hover:text-slate-700 transition-colors opacity-80 hover:opacity-100" href="#">Documentation</a>
          <a className="hover:text-slate-700 transition-colors opacity-80 hover:opacity-100" href="#">System Status</a>
          <a className="hover:text-slate-700 transition-colors opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default Summary;
