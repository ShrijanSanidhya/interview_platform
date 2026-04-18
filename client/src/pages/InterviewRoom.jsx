import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Editor from '@monaco-editor/react';

const InterviewRoom = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  
  const [code, setCode] = useState('// Write your code here...');
  const [chatParams, setChatParams] = useState({ message: '', messages: [] });
  const [typing, setTyping] = useState(null);
  const typingTimeout = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!socket || !user) return;
    socket.emit('join-room', { roomId: id, user });

    const handleCodeSync = (newCode) => {
      setCode(newCode);
    };

    const handleReceiveMsg = (data) => {
      setChatParams(prev => ({ ...prev, messages: [...prev.messages, data] }));
    };

    const handleTyping = (typingUser) => {
      setTyping(typingUser.name);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(null), 2000);
    };

    const handleUserJoin = (data) => {
      setChatParams(prev => ({ ...prev, messages: [...prev.messages, { ...data, isSystem: true }] }));
    };

    socket.on('code-sync', handleCodeSync);
    socket.on('receive-message', handleReceiveMsg);
    socket.on('user-typing', handleTyping);
    socket.on('user-joined', handleUserJoin);
    socket.on('user-left', handleUserJoin);

    return () => {
      socket.off('code-sync', handleCodeSync);
      socket.off('receive-message', handleReceiveMsg);
      socket.off('user-typing', handleTyping);
      socket.off('user-joined', handleUserJoin);
      socket.off('user-left', handleUserJoin);
      socket.emit('leave-room', { roomId: id, user });
    };
  }, [id, socket, user]);

  useEffect(() => {
     if(chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
     }
  }, [chatParams.messages, typing]);

  const handleEditorChange = (value) => {
    setCode(value);
    if (socket) socket.emit('code-change', { roomId: id, code: value });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatParams.message.trim() || !socket || !user) return;
    socket.emit('chat-message', { roomId: id, message: chatParams.message, user });
    setChatParams(prev => ({ ...prev, message: '' }));
  };

  const handleTypingActivity = (e) => {
    setChatParams(prev => ({ ...prev, message: e.target.value }));
    if(socket && user) {
        socket.emit('typing', { roomId: id, user });
    }
  };

  const endInterview = () => {
    navigate(`/summary/${id}`);
  };

  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex flex-col font-body">
      {/* Top Navigation Area */}
      <header className="w-full h-18 z-30 flex justify-between items-center px-8 py-4 flex-shrink-0 border-b border-surface-container-highest">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-primary tracking-tight">SilkCode</span>
          <div className="h-6 w-px bg-outline-variant/50 mx-2"></div>
          <span className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">tag</span>
            Room {id.substring(0,8).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Timer */}
          <div className="flex items-center gap-2 text-on-surface font-semibold neo-pressed rounded-full px-4 py-2 bg-surface">
            <span aria-hidden="true" className="material-symbols-outlined text-primary">timer</span>
            45:00
          </div>
          
          {/* Controls */}
          {user?.role === 'Interviewer' ? (
             <button onClick={endInterview} className="flex items-center gap-2 bg-surface text-error font-semibold py-2 px-6 rounded-full neo-raised active:neo-pressed transition-all duration-200">
                <span aria-hidden="true" className="material-symbols-outlined">call_end</span>
                End Interview
             </button>
          ) : (
             <button onClick={endInterview} className="flex items-center gap-2 bg-surface text-tertiary font-semibold py-2 px-6 rounded-full neo-raised active:neo-pressed transition-all duration-200">
                <span aria-hidden="true" className="material-symbols-outlined">play_arrow</span>
                Submit Solution
             </button>
          )}

          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 bg-surface text-on-surface-variant font-semibold py-2 px-6 rounded-full neo-raised active:neo-pressed transition-all duration-200">
             Leave Room
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 w-full max-w-[1920px] mx-auto">
        {/* Left Panel: Problem Description */}
        <section className="w-1/4 min-w-[300px] flex flex-col bg-surface rounded-xl neo-raised p-6 gap-4 overflow-hidden">
          <h2 className="text-lg font-semibold text-on-surface">1. Two Sum</h2>
          <div className="flex gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-surface neo-pressed text-primary font-medium">Easy</span>
            <span className="px-3 py-1 rounded-full bg-surface neo-pressed text-on-surface-variant">Arrays</span>
            <span className="px-3 py-1 rounded-full bg-surface neo-pressed text-on-surface-variant">Hash Table</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 text-sm text-on-surface-variant space-y-4 font-body leading-relaxed">
            <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
            <p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>
            <p>You can return the answer in any order.</p>
            
            <div className="p-4 rounded-lg bg-surface neo-pressed mt-4">
              <p className="font-semibold text-on-surface mb-2">Example 1:</p>
              <p><strong>Input:</strong> nums = [2,7,11,15], target = 9</p>
              <p><strong>Output:</strong> [0,1]</p>
              <p><strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</p>
            </div>
          </div>
        </section>

        {/* Center Panel: Code Editor */}
        <section className="flex-1 flex flex-col bg-surface rounded-xl neo-pressed p-4 overflow-hidden relative">
          {/* Editor Toolbar */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant/30">
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-md bg-surface neo-raised text-sm font-medium text-primary flex items-center gap-2">
                Javascript
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
            <div className="flex gap-3">
              <button className="p-1.5 rounded-md bg-surface neo-raised text-on-surface-variant hover:text-primary transition-colors" title="Settings">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">settings</span>
              </button>
              <button className="p-1.5 rounded-md bg-surface neo-raised text-on-surface-variant hover:text-primary transition-colors" title="Format Code">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">format_align_left</span>
              </button>
            </div>
          </div>
          
          {/* Code Area */}
          <div className="flex-1 overflow-hidden font-mono text-sm leading-relaxed text-on-surface-variant rounded-md">
             <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{ 
                   minimap: { enabled: false }, 
                   fontSize: 14, 
                   fontFamily: "'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
                   scrollBeyondLastLine: false,
                   padding: { top: 16 }
                }}
             />
          </div>
          
          {/* Subtle Hint Toast inside editor area */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface neo-raised px-4 py-2 rounded-full flex items-center gap-2 text-sm text-on-surface-variant animate-pulse pointer-events-none">
            <span aria-hidden="true" className="material-symbols-outlined text-tertiary text-lg">lightbulb</span>
            Consider using a Hash Map for O(n) time complexity.
          </div>
        </section>

        {/* Right Panel: Chat & Console */}
        <section className="w-1/4 min-w-[300px] flex flex-col gap-6">
          {/* Video/Audio Placeholders */}
          <div className="flex flex-col gap-4">
            {/* Interviewer */}
            <div className="h-32 bg-surface rounded-xl neo-pressed overflow-hidden relative flex items-center justify-center">
              <img alt="Interviewer Video Stream" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf4_mSXlaNt_GAML9t5THslEeb3Pmdm0KF_X0m89RMhkcFuJqzYwP1aqbc3vVa2FxEhAgP6FDx3th8r_N8vV71YW-GWaRSF_C1ONIfGREqnlgNckWttiP3NTc_owJUrwHQ03I_4-heBiK5Yo4Avww-nsBKd8iv3MgT-JC_swS0FzDKWG1yefhAsHne1iCC5WpHfxQ1-Okz5aKbFVkcCiZmpoyarblvDTEhG7gZjEvvDOHUsIcdClrxI72VUM9r2_xKgBPLO44ZZvE"/>
              <div className="absolute bottom-2 left-2 bg-surface/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium neo-raised">Interviewer</div>
              <div className="absolute top-2 right-2 bg-error text-on-error rounded-full p-1 shadow-md">
                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">mic_off</span>
              </div>
            </div>
            
            {/* Candidate (Self) */}
            <div className="h-32 bg-surface rounded-xl neo-pressed overflow-hidden relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-surface neo-raised flex items-center justify-center text-primary font-semibold">ME</div>
              <div className="absolute bottom-2 left-2 bg-surface/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium neo-raised">You</div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-surface rounded-xl neo-raised p-4 flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined">chat</span>
              Chat
            </h3>
            
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 text-sm flex flex-col pt-2 pb-2">
               {chatParams.messages.map((msg, i) => {
                  if (msg.isSystem) {
                     return <div key={i} className="text-center text-xs text-on-surface-variant italic">{msg.message}</div>;
                  }
                  const isMe = msg.user?._id === user?._id;
                  return (
                     <div key={i} className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className={`text-[10px] text-on-surface-variant font-medium ${isMe ? 'mr-2' : 'ml-2'}`}>
                           {isMe ? 'You' : msg.user?.name || 'User'}
                        </span>
                        <div className={`px-3 py-2 text-on-surface-variant max-w-[85%] ${isMe ? 'bg-primary/10 rounded-2xl rounded-tr-sm border border-primary/20' : 'bg-surface neo-pressed rounded-2xl rounded-tl-sm'}`}>
                           {msg.message}
                        </div>
                     </div>
                  );
               })}
               
               {/* Typing Indicator */}
               {typing && (
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant italic mt-2">
                     <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                        <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                     </span>
                     {typing} is typing...
                  </div>
               )}
            </div>
            
            {/* Chat Input */}
            <form onSubmit={sendMessage} className="mt-4 pt-4 border-t border-outline-variant/30 flex gap-2">
              <input 
                 value={chatParams.message}
                 onChange={handleTypingActivity}
                 className="flex-1 bg-surface neo-pressed border-none rounded-full px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" 
                 placeholder="Type a message..." 
                 type="text"
              />
              <button type="submit" className="bg-surface neo-raised text-primary w-10 h-10 rounded-full flex items-center justify-center active:neo-pressed transition-all flex-shrink-0">
                 <span aria-hidden="true" className="material-symbols-outlined">send</span>
              </button>
            </form>

          </div>
        </section>
      </main>
    </div>
  );
};

export default InterviewRoom;
