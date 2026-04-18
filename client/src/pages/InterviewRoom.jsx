import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Editor from '@monaco-editor/react';

const BASE_URL = 'http://localhost:5005';

const InterviewRoom = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [code, setCode] = useState('// Write your solution here\n\nfunction twoSum(nums, target) {\n  // Your code here\n}');
  const [chatParams, setChatParams] = useState({ message: '', messages: [] });
  const [typing, setTyping] = useState(null);
  const [timerStr, setTimerStr] = useState('45:00');
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [evalResult, setEvalResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [activePanel, setActivePanel] = useState('chat'); // 'chat' | 'notes'

  const typingTimeout = useRef(null);
  const chatContainerRef = useRef(null);
  const timerRef = useRef(null);
  const isHost = useRef(false);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Fetch session notes on mount (for interviewers)
  useEffect(() => {
    if (!user || user.role !== 'Interviewer') return;
    fetch(`${BASE_URL}/api/sessions/${id}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(r => r.json())
      .then(data => { if (data.notes) setNotes(data.notes); })
      .catch(console.error);
  }, [id, user]);

  // Socket setup
  useEffect(() => {
    if (!socket || !user) return;
    socket.emit('join-room', { roomId: id, user });

    const handleCodeSync = (newCode) => setCode(newCode);
    const handleReceiveMsg = (data) => {
      setChatParams(prev => ({ ...prev, messages: [...prev.messages, data] }));
    };
    const handleTyping = (name) => {
      setTyping(name);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(null), 2000);
    };
    const handleUserEvent = (data) => {
      setChatParams(prev => ({ ...prev, messages: [...prev.messages, { ...data, isSystem: true }] }));
    };
    const handleEvalResult = (result) => setEvalResult(result);
    const handleTimerUpdate = (timeStr) => setTimerStr(timeStr);

    socket.on('code-sync', handleCodeSync);
    socket.on('receive-message', handleReceiveMsg);
    socket.on('user-typing', handleTyping);
    socket.on('user-joined', handleUserEvent);
    socket.on('user-left', handleUserEvent);
    socket.on('evaluation-result', handleEvalResult);
    socket.on('timer-update', handleTimerUpdate);

    return () => {
      socket.off('code-sync', handleCodeSync);
      socket.off('receive-message', handleReceiveMsg);
      socket.off('user-typing', handleTyping);
      socket.off('user-joined', handleUserEvent);
      socket.off('user-left', handleUserEvent);
      socket.off('evaluation-result', handleEvalResult);
      socket.off('timer-update', handleTimerUpdate);
      socket.emit('leave-room', { roomId: id, user });
    };
  }, [id, socket, user]);

  // Timer: host drives it, broadcasts to guest
  useEffect(() => {
    if (!socket || !user) return;
    // First user in creates the room & drives the timer
    isHost.current = user.role === 'Interviewer';
    if (!isHost.current) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1;
        const ts = formatTime(next);
        setTimerStr(ts);
        if (socket) socket.emit('sync-timer', { roomId: id, timeStr: ts });
        if (next <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [id, socket, user]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatParams.messages, typing]);

  const handleEditorChange = (value) => {
    setCode(value);
    if (socket) socket.emit('code-change', { roomId: id, code: value });
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setEvalResult(null);
    try {
      const res = await fetch(`${BASE_URL}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ code, roomId: id })
      });
      const result = await res.json();
      setEvalResult(result);
      // Broadcast result to the other user
      if (socket) socket.emit('code-executed', { roomId: id, result });
    } catch (err) {
      setEvalResult({ success: false, error: 'Server unreachable', testCasesPassed: 0, totalTestCases: 3 });
    } finally {
      setIsRunning(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatParams.message.trim() || !socket || !user) return;
    socket.emit('chat-message', { roomId: id, message: chatParams.message, user });
    setChatParams(prev => ({ ...prev, message: '' }));
  };

  const handleTypingActivity = (e) => {
    setChatParams(prev => ({ ...prev, message: e.target.value }));
    if (socket && user) socket.emit('typing', { roomId: id, user });
  };

  const saveNotes = async () => {
    try {
      await fetch(`${BASE_URL}/api/sessions/${id}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ notes })
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save notes', err);
    }
  };

  const endInterview = async () => {
    try {
      await fetch(`${BASE_URL}/api/sessions/${id}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ code, timeTakenStr: timerStr })
      });
    } catch (err) {
      console.error('Failed to end session cleanly', err);
    }
    navigate(`/summary/${id}`);
  };

  const isTimeLow = secondsLeft <= 300 && user?.role === 'Interviewer'; // last 5 min

  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex flex-col font-body">
      {/* Header */}
      <header className="w-full flex-shrink-0 flex justify-between items-center px-8 py-4 border-b border-surface-container-highest">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-primary tracking-tight">SilkCode</span>
          <div className="h-6 w-px bg-outline-variant/50 mx-2"></div>
          <span className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">tag</span>
            Room {id?.substring(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={`flex items-center gap-2 font-semibold neo-pressed rounded-full px-4 py-2 bg-surface ${isTimeLow ? 'text-error' : 'text-on-surface'}`}>
            <span className={`material-symbols-outlined ${isTimeLow ? 'text-error' : 'text-primary'}`}>timer</span>
            {timerStr}
          </div>

          {/* Run Code */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 bg-surface text-tertiary font-semibold py-2 px-5 rounded-full neo-raised active:neo-pressed transition-all duration-200 disabled:opacity-60"
          >
            <span className="material-symbols-outlined">{isRunning ? 'hourglass_top' : 'play_arrow'}</span>
            {isRunning ? 'Running...' : 'Run Code'}
          </button>

          {user?.role === 'Interviewer' ? (
            <button onClick={endInterview} className="flex items-center gap-2 bg-surface text-error font-semibold py-2 px-5 rounded-full neo-raised active:neo-pressed transition-all duration-200">
              <span className="material-symbols-outlined">call_end</span>
              End Interview
            </button>
          ) : (
            <button onClick={endInterview} className="flex items-center gap-2 bg-surface text-primary font-semibold py-2 px-5 rounded-full neo-raised active:neo-pressed transition-all duration-200">
              <span className="material-symbols-outlined">send</span>
              Submit
            </button>
          )}

          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 bg-surface text-on-surface-variant font-semibold py-2 px-5 rounded-full neo-raised active:neo-pressed transition-all duration-200">
            Leave
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4 w-full max-w-[1920px] mx-auto">
        {/* Left: Problem Description */}
        <section className="w-[260px] flex-shrink-0 flex flex-col bg-surface rounded-xl neo-raised p-5 gap-4 overflow-hidden">
          <h2 className="text-base font-semibold text-on-surface">1. Two Sum</h2>
          <div className="flex gap-2 flex-wrap text-xs">
            <span className="px-2 py-1 rounded-full bg-surface neo-pressed text-primary font-medium">Easy</span>
            <span className="px-2 py-1 rounded-full bg-surface neo-pressed text-on-surface-variant">Arrays</span>
          </div>
          <div className="flex-1 overflow-y-auto text-sm text-on-surface-variant space-y-3 leading-relaxed">
            <p>Given an array of integers <code className="bg-surface neo-pressed px-1 rounded text-xs">nums</code> and an integer <code className="bg-surface neo-pressed px-1 rounded text-xs">target</code>, return <em>indices of the two numbers such that they add up to target</em>.</p>
            <p>Each input has <strong>exactly one solution</strong>. You may not use the same element twice.</p>
            <div className="p-3 rounded-lg bg-surface neo-pressed">
              <p className="font-semibold text-on-surface mb-1 text-xs uppercase tracking-wide">Example</p>
              <p className="text-xs"><strong>Input:</strong> nums = [2,7,11,15], target = 9</p>
              <p className="text-xs"><strong>Output:</strong> [0,1]</p>
            </div>
            <div className="p-3 rounded-lg bg-surface neo-pressed">
              <p className="font-semibold text-on-surface mb-1 text-xs uppercase tracking-wide">Constraint</p>
              <p className="text-xs">Name your function <code className="text-primary">twoSum(nums, target)</code></p>
            </div>

            {/* Eval Result */}
            {evalResult && (
              <div className={`p-3 rounded-lg neo-pressed ${evalResult.success ? 'border border-green-600/30' : 'border border-error/30'}`}>
                <p className={`font-bold text-sm mb-1 ${evalResult.success ? 'text-green-400' : 'text-error'}`}>
                  {evalResult.success ? '✓ All Tests Passed!' : '✗ Tests Failed'}
                </p>
                <p className="text-xs text-on-surface-variant">{evalResult.testCasesPassed}/{evalResult.totalTestCases} test cases passed</p>
                {evalResult.error && <p className="text-xs text-error mt-1">{evalResult.error}</p>}
              </div>
            )}
          </div>
        </section>

        {/* Center: Code Editor */}
        <section className="flex-1 flex flex-col bg-surface rounded-xl neo-pressed overflow-hidden relative">
          <div className="flex justify-between items-center px-4 py-3 border-b border-outline-variant/20 flex-shrink-0">
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-md bg-surface neo-raised text-sm font-medium text-primary flex items-center gap-1">
                JavaScript
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-md bg-surface neo-raised text-on-surface-variant hover:text-primary" title="Settings">
                <span className="material-symbols-outlined text-[18px]">settings</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'SF Mono', Consolas, Menlo, monospace",
                scrollBeyondLastLine: false,
                padding: { top: 12 }
              }}
            />
          </div>
        </section>

        {/* Right: Chat / Notes + Video */}
        <section className="w-[280px] flex-shrink-0 flex flex-col gap-4">
          {/* Video placeholders */}
          <div className="flex gap-2">
            <div className="flex-1 h-24 bg-surface rounded-xl neo-pressed overflow-hidden relative flex items-center justify-center">
              <img alt="Interviewer" className="w-full h-full object-cover opacity-70" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf4_mSXlaNt_GAML9t5THslEeb3Pmdm0KF_X0m89RMhkcFuJqzYwP1aqbc3vVa2FxEhAgP6FDx3th8r_N8vV71YW-GWaRSF_C1ONIfGREqnlgNckWttiP3NTc_owJUrwHQ03I_4-heBiK5Yo4Avww-nsBKd8iv3MgT-JC_swS0FzDKWG1yefhAsHne1iCC5WpHfxQ1-Okz5aKbFVkcCiZmpoyarblvDTEhG7gZjEvvDOHUsIcdClrxI72VUM9r2_xKgBPLO44ZZvE" />
              <div className="absolute bottom-1 left-1 bg-surface/80 px-1.5 py-0.5 rounded text-[10px] font-medium neo-raised">Interviewer</div>
            </div>
            <div className="flex-1 h-24 bg-surface rounded-xl neo-pressed flex items-center justify-center relative">
              <div className="w-8 h-8 rounded-full bg-surface neo-raised flex items-center justify-center text-primary font-semibold text-xs">
                {user?.name?.[0]?.toUpperCase() || 'ME'}
              </div>
              <div className="absolute bottom-1 left-1 bg-surface/80 px-1.5 py-0.5 rounded text-[10px] font-medium neo-raised">You</div>
            </div>
          </div>

          {/* Tab switcher: Chat | Notes (Interviewer only) */}
          <div className="flex gap-2">
            <button
              onClick={() => setActivePanel('chat')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activePanel === 'chat' ? 'bg-surface neo-pressed text-primary' : 'bg-surface neo-raised text-on-surface-variant hover:text-primary'}`}
            >
              Chat
            </button>
            {user?.role === 'Interviewer' && (
              <button
                onClick={() => setActivePanel('notes')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activePanel === 'notes' ? 'bg-surface neo-pressed text-primary' : 'bg-surface neo-raised text-on-surface-variant hover:text-primary'}`}
              >
                Notes
              </button>
            )}
          </div>

          {/* Chat Panel */}
          {activePanel === 'chat' && (
            <div className="flex-1 bg-surface rounded-xl neo-raised p-4 flex flex-col overflow-hidden min-h-0">
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 text-sm flex flex-col pb-2 min-h-0">
                {chatParams.messages.length === 0 && (
                  <p className="text-center text-xs text-on-surface-variant italic mt-4">Messages appear here...</p>
                )}
                {chatParams.messages.map((msg, i) => {
                  if (msg.isSystem) return (
                    <div key={i} className="text-center text-xs text-on-surface-variant italic">{msg.message}</div>
                  );
                  const isMe = msg.user?._id === user?._id;
                  return (
                    <div key={i} className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className={`text-[10px] text-on-surface-variant font-medium ${isMe ? 'mr-1' : 'ml-1'}`}>
                        {isMe ? 'You' : msg.user?.name || 'User'}
                      </span>
                      <div className={`px-3 py-1.5 text-on-surface-variant max-w-[90%] text-xs ${isMe ? 'bg-primary/10 rounded-2xl rounded-tr-sm border border-primary/20' : 'bg-surface neo-pressed rounded-2xl rounded-tl-sm'}`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant italic">
                    <span className="flex gap-0.5">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <span key={i} className="w-1 h-1 bg-tertiary rounded-full animate-bounce" style={{ animationDelay: `${d}s` }}></span>
                      ))}
                    </span>
                    {typing} is typing...
                  </div>
                )}
              </div>
              <form onSubmit={sendMessage} className="mt-3 flex gap-2 flex-shrink-0">
                <input
                  value={chatParams.message}
                  onChange={handleTypingActivity}
                  className="flex-1 bg-surface neo-pressed rounded-full px-3 py-2 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Type a message..."
                />
                <button type="submit" className="bg-surface neo-raised text-primary w-8 h-8 rounded-full flex items-center justify-center active:neo-pressed flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </form>
            </div>
          )}

          {/* Notes Panel (Interviewer only) */}
          {activePanel === 'notes' && user?.role === 'Interviewer' && (
            <div className="flex-1 bg-surface rounded-xl neo-raised p-4 flex flex-col overflow-hidden min-h-0">
              <h3 className="text-sm font-semibold text-on-surface mb-3 flex justify-between items-center">
                Private Notes
                {notesSaved && <span className="text-xs text-green-400">Saved!</span>}
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 bg-surface neo-pressed rounded-xl p-3 text-xs text-on-surface outline-none resize-none leading-relaxed"
                placeholder="Write your evaluation notes here..."
              />
              <button
                onClick={saveNotes}
                className="mt-3 bg-surface neo-raised text-primary text-sm font-medium py-2 rounded-xl active:neo-pressed transition-all flex-shrink-0"
              >
                Save Notes
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default InterviewRoom;
