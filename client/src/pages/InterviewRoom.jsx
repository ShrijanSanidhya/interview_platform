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
  let typingTimeout = useRef(null);

  useEffect(() => {
    if (!socket) return;
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

  const handleEditorChange = (value) => {
    setCode(value);
    if (socket) socket.emit('code-change', { roomId: id, code: value });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatParams.message.trim()) return;
    socket.emit('chat-message', { roomId: id, message: chatParams.message, user });
    setChatParams(prev => ({ ...prev, message: '' }));
  };

  const handleTypingActivity = (e) => {
    setChatParams(prev => ({ ...prev, message: e.target.value }));
    socket.emit('typing', { roomId: id, user });
  };

  const endInterview = () => {
    navigate(`/summary/${id}`);
  };

  return (
    <div className="h-screen flex flex-col p-4 bg-[var(--color-background)] overflow-hidden gap-4 max-w-[1920px] mx-auto">
      <header className="flex justify-between items-center neo-raised p-4">
        <div>
          <h1 className="text-xl font-bold">Interview Room</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)]">ID: {id}</p>
        </div>
        <div className="flex gap-4">
          {user.role === 'Interviewer' && (
            <button onClick={endInterview} className="neo-raised px-6 py-2 text-red-500 font-bold hover:text-red-600 active:neo-inset">
              End Interview
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} className="neo-raised px-6 py-2 text-[var(--color-primary)] font-bold active:neo-inset">
            Leave Room
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 neo-inset p-2 rounded-xl overflow-hidden flex flex-col">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{ minimap: { enabled: false }, fontSize: 16, scrollBeyondLastLine: false }}
          />
        </div>

        {/* Chat / Sidebar */}
        <div className="w-80 flex flex-col gap-4">
          <div className="flex-1 flex flex-col neo-raised p-4 overflow-hidden">
            <h3 className="font-bold text-lg border-b pb-2 mb-2 border-slate-300">Chat</h3>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2">
              {chatParams.messages.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.isSystem ? 'text-center italic text-gray-500' : ''}`}>
                  {!msg.isSystem && (
                    <span className="font-bold mr-2 text-[var(--color-primary)]">
                      {msg.user.name}:
                    </span>
                  )}
                  <span>{msg.message}</span>
                </div>
              ))}
            </div>
            {typing && <div className="text-xs text-gray-500 italic mb-2">{typing} is typing...</div>}
            <form onSubmit={sendMessage} className="flex mt-2">
              <input 
                type="text" 
                value={chatParams.message} 
                onChange={handleTypingActivity} 
                placeholder="Type a message..."
                className="neo-inset flex-1 p-3 text-sm outline-none rounded-r-none" 
              />
              <button type="submit" className="neo-raised p-3 text-[var(--color-primary)] rounded-l-none font-bold active:neo-inset">Send</button>
            </form>
          </div>
          
          <div className="h-48 neo-raised p-4">
               <h3 className="font-bold text-lg mb-2">Timer & Controls</h3>
               <div className="text-4xl font-mono text-center mb-4 text-[var(--color-on-surface-variant)]">00:00</div>
               {user.role === 'Candidate' && (
                  <button className="neo-raised w-full py-3 font-bold text-green-600 active:neo-inset" onClick={endInterview}>Submit Code</button>
               )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
