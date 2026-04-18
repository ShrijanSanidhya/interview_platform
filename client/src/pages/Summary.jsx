import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:5005';

const Summary = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    fetch(`${BASE_URL}/api/sessions/${id}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(r => r.json())
      .then(data => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, user]);

  // Calculate time taken
  const calcTimeTaken = () => {
    if (!session?.startTime || !session?.endTime) return '--:--';
    const diff = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000);
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const passed = session?.testCasesPassed ?? 0;
  const total = session?.totalTestCases ?? 3;
  const allPassed = passed === total && total > 0;
  const timeTaken = calcTimeTaken();

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col font-body">
      {/* TopNavBar */}
      <header className="w-full sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-surface-container/20 flex justify-between items-center px-8 max-w-full py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-primary font-semibold flex items-center gap-2 hover:bg-surface/40 rounded-full p-2 transition-all duration-300">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Dashboard
          </button>
        </div>
        <div className="text-xl font-bold text-primary tracking-tight font-headline">SilkCode</div>
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:bg-surface/40 rounded-full p-2 transition-all">
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-on-surface mb-2 font-headline">Interview Summary</h1>
          <p className="text-on-surface-variant text-lg">
            Room {id?.substring(0, 8).toUpperCase()}
            {session?.candidateId?.name && ` · ${session.candidateId.name}`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 text-on-surface-variant">
            Loading session data...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Status Card */}
            <div className="md:col-span-2 neo-raised bg-surface rounded-xl p-8 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="w-32 h-32 rounded-full neo-inset flex items-center justify-center mb-6 bg-surface">
                <span
                  className={`material-symbols-outlined text-6xl ${allPassed ? 'text-primary' : 'text-error'}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {allPassed ? 'check_circle' : 'cancel'}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-on-surface mb-2 font-headline">
                {allPassed ? 'Assessment Passed' : total === 0 ? 'Session Complete' : 'Needs Improvement'}
              </h2>
              <p className="text-on-surface-variant text-center max-w-md mb-8">
                {allPassed
                  ? 'Excellent performance! Strong problem-solving skills and code efficiency demonstrated.'
                  : total === 0
                    ? 'No code was submitted. Review the session recording for feedback.'
                    : `${passed} of ${total} test cases passed. Keep practising!`}
              </p>

              <div className="flex gap-4 w-full justify-center flex-wrap">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="neo-raised bg-surface text-primary font-semibold py-3 px-8 rounded-xl active:neo-inset transition-all duration-200 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                  Back to Dashboard
                </button>

                {session?.codeSubmitted && (
                  <button
                    onClick={() => {
                      const blob = new Blob([session.codeSubmitted], { type: 'text/javascript' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `submission-${id?.substring(0, 8)}.js`;
                      a.click();
                    }}
                    className="neo-raised bg-surface text-primary font-semibold py-3 px-8 rounded-xl active:neo-inset transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Download Code
                  </button>
                )}
              </div>

              {/* Interviewer Notes */}
              {session?.notes && (
                <div className="mt-8 w-full p-4 rounded-xl neo-inset text-left">
                  <h4 className="text-sm font-semibold text-on-surface mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">note_alt</span>
                    Interviewer Notes
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{session.notes}</p>
                </div>
              )}
            </div>

            {/* Stats Column */}
            <div className="flex flex-col gap-6 md:col-span-1">
              {/* Time Taken */}
              <div className="neo-raised bg-surface rounded-xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant mb-1 uppercase tracking-wider">Time Taken</p>
                  <p className="text-3xl font-bold text-on-surface font-headline">{timeTaken}</p>
                  <p className="text-xs text-secondary mt-1">out of 45:00 limit</p>
                </div>
                <div className="w-16 h-16 rounded-full neo-inset flex items-center justify-center bg-surface">
                  <span className="material-symbols-outlined text-tertiary text-3xl">timer</span>
                </div>
              </div>

              {/* Test Cases */}
              <div className="neo-raised bg-surface rounded-xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant mb-1 uppercase tracking-wider">Test Cases</p>
                  <p className="text-3xl font-bold text-on-surface font-headline">{passed}/{total}</p>
                  <p className={`text-xs mt-1 font-medium ${allPassed ? 'text-primary' : 'text-error'}`}>
                    {total === 0 ? 'Code not executed' : allPassed ? '100% Passed' : `${Math.round((passed / total) * 100)}% Passed`}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full neo-inset flex items-center justify-center bg-surface">
                  <span className="material-symbols-outlined text-primary text-3xl">fact_check</span>
                </div>
              </div>

              {/* Attempts */}
              <div className="neo-raised bg-surface rounded-xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant mb-1 uppercase tracking-wider">Attempts</p>
                  <p className="text-3xl font-bold text-on-surface font-headline">{session?.attempts ?? 0}</p>
                  <p className="text-xs text-secondary mt-1">Code executions</p>
                </div>
                <div className="w-16 h-16 rounded-full neo-inset flex items-center justify-center bg-surface">
                  <span className="material-symbols-outlined text-on-surface-variant text-3xl">replay</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-6 bg-background flex flex-col md:flex-row justify-between items-center px-12 border-t border-white/10 mt-auto">
        <div className="text-xs text-slate-500 mb-4 md:mb-0">
          © 2024 SilkCode Real-time IDE. Neomorphic Edition.
        </div>
        <div className="flex gap-6 text-xs text-slate-500">
          <a className="hover:text-slate-700 transition-colors" href="#">Documentation</a>
          <a className="hover:text-slate-700 transition-colors" href="#">System Status</a>
          <a className="hover:text-slate-700 transition-colors" href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default Summary;
