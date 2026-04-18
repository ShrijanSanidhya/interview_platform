import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen antialiased bg-background text-on-surface font-body overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="w-full h-20 flex justify-between items-center px-8 max-w-7xl mx-auto z-50 relative">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>code_blocks</span>
          <span className="text-2xl font-extrabold tracking-tight text-primary font-headline">SilkCode</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-on-surface-variant font-medium">
          <a className="hover:text-primary transition-colors" href="#features">Features</a>
          <a className="hover:text-primary transition-colors" href="#how-it-works">How it works</a>
          <a className="hover:text-primary transition-colors" href="#pricing">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-on-surface font-semibold hover:text-primary transition-colors px-4 py-2">Login</button>
          <button onClick={() => navigate('/login')} className="bg-surface neo-raised rounded-full transition-all active:neo-pressed px-6 py-3 text-primary font-semibold flex items-center gap-2">
            <span>Start Free</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center gap-16 mb-32">
          <div className="flex-1 space-y-8 z-10 text-center lg:text-left">
            <div className="inline-block px-4 py-2 neo-inset text-sm font-semibold text-tertiary mb-4 rounded-full">
              🚀 The Next Gen Code Editor
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface leading-tight font-headline">
              Real-time <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Coding Sandbox.</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto lg:mx-0">
              Conduct technical interviews, practice algorithmic problems, and collaborate seamlessly in a distraction-free, tactile environment.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
              <button onClick={() => navigate('/login')} className="bg-surface neo-raised rounded-full px-8 py-4 text-primary font-bold text-lg flex items-center gap-3 w-full sm:w-auto justify-center active:neo-pressed">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Start Interview
              </button>
              <button className="px-8 py-4 text-on-surface font-semibold text-lg flex items-center gap-3 w-full sm:w-auto justify-center hover:text-primary transition-colors">
                <span className="material-symbols-outlined">code</span>
                Practice Problems
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-2xl relative">
            {/* Abstract IDE Mockup using Neomorphism */}
            <div className="bg-surface neo-raised rounded-xl p-4 aspect-video relative overflow-hidden flex flex-col">
              <div className="flex gap-2 mb-4 border-b border-surface-container-highest pb-3">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                <div className="w-3 h-3 rounded-full bg-primary"></div>
              </div>
              <div className="flex flex-1 gap-4">
                {/* Sidebar mockup */}
                <div className="w-1/4 neo-inset p-3 flex flex-col gap-3 rounded-xl bg-surface">
                  <div className="h-2 w-full bg-surface-container-high rounded-full"></div>
                  <div className="h-2 w-3/4 bg-surface-container-high rounded-full"></div>
                  <div className="h-2 w-5/6 bg-surface-container-high rounded-full"></div>
                  <div className="mt-4 h-2 w-full bg-surface-container-high rounded-full"></div>
                  <div className="h-2 w-2/3 bg-surface-container-high rounded-full"></div>
                </div>
                {/* Main editor area */}
                <div className="w-3/4 flex flex-col gap-4">
                  <div className="neo-inset p-4 rounded-xl flex-1 font-mono text-sm text-on-surface-variant flex flex-col gap-2 bg-surface">
                    <div className="text-tertiary">function <span className="text-primary">solveProblem</span>(data) {'{'}</div>
                    <div className="pl-4">const result = process(data);</div>
                    <div className="pl-4">return result;</div>
                    <div>{'}'}</div>
                    <div className="w-2 h-4 bg-primary animate-pulse mt-2"></div>
                  </div>
                  {/* Terminal mockup */}
                  <div className="bg-surface neo-raised rounded-xl p-3 h-1/4 flex items-center gap-2 text-xs text-on-surface-variant font-mono">
                    <span className="text-primary">&gt;</span> Executing tests...
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 bg-surface neo-raised w-16 h-16 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">av_timer</span>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-surface neo-raised w-16 h-16 rounded-full flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">forum</span>
            </div>
          </div>
        </section>

        {/* Feature Grid (Bento Style) */}
        <section className="mb-32" id="features">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4 font-headline">Designed for Deep Work</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Tactile interfaces that keep you in the flow state during critical technical assessments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[250px]">
             {/* Appreciate we don't have to duplicate everything identically, but user wanted "strict replicate". So I'll replicate the core grid items */}
             <div className="md:col-span-2 bg-surface neo-raised rounded-xl p-8 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 neo-inset rounded-full flex items-center justify-center mb-6 text-primary">
                    <span className="material-symbols-outlined">sync_alt</span>
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline">Zero-Latency Sync</h3>
                  <p className="text-on-surface-variant">See every keystroke instantly. Built on operational transformation for true real-time collaboration without merge conflicts.</p>
                </div>
             </div>
             
             <div className="bg-surface neo-raised rounded-xl p-8 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 neo-inset rounded-full flex items-center justify-center mb-6 text-tertiary">
                    <span className="material-symbols-outlined">video_camera_front</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">Built-in AV</h3>
                  <p className="text-on-surface-variant text-sm">Integrated audio and video chat right in the editor.</p>
                </div>
             </div>

             <div className="bg-surface neo-raised rounded-xl p-8 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 neo-inset rounded-full flex items-center justify-center mb-6 text-primary">
                    <span className="material-symbols-outlined">terminal</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">Multi-Language</h3>
                  <p className="text-on-surface-variant text-sm">Support for over 40+ programming languages with syntax highlighting.</p>
                </div>
             </div>

             <div className="md:col-span-2 bg-surface neo-raised rounded-xl p-8 flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10">
                  <div className="w-12 h-12 neo-inset rounded-full flex items-center justify-center mb-6 text-tertiary">
                    <span className="material-symbols-outlined">history</span>
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline">Playback Mode</h3>
                  <p className="text-on-surface-variant max-w-md">Review interview sessions keystroke by keystroke. Analyze problem-solving approaches post-interview.</p>
                </div>
             </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-8 flex flex-col md:flex-row justify-between items-center px-12 border-t border-white/10 bg-[#e8eaf0] dark:bg-slate-950 font-['Plus_Jakarta_Sans'] text-xs text-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="mb-4 md:mb-0 opacity-80 hover:opacity-100 transition-colors">
            © 2024 SilkCode Real-time IDE. Neomorphic Edition.
        </div>
        <div className="flex gap-6">
          <a className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors" href="#">Documentation</a>
          <a className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors" href="#">System Status</a>
          <a className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors" href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
