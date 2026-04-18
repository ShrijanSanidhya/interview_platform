import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const createRoom = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/room/${data.roomId}`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-[var(--color-on-surface-variant)] font-medium">Hello, {user.name} ({user.role})</span>
          <button onClick={logout} className="neo-raised px-4 py-2 font-medium text-[var(--color-primary)] active:neo-inset">Log out</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {user.role === 'Interviewer' && (
          <div className="neo-raised p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-semibold mb-2">Create Interview Room</h2>
            <p className="text-[var(--color-on-surface-variant)] flex-grow">Start a new secure interview session and invite a candidate to join your live code environment.</p>
            <button onClick={createRoom} className="neo-raised py-4 font-bold text-[var(--color-primary)] active:neo-inset hover:text-[var(--color-primary-focus)]">Create Room</button>
          </div>
        )}

        <div className="neo-raised p-8 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold mb-2">Join a Room</h2>
          <p className="text-[var(--color-on-surface-variant)]">Enter your room ID provided by the interviewer to join a session.</p>
          <input 
            type="text" 
            placeholder="Room ID" 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)}
            className="neo-inset w-full p-4 mt-auto outline-none" 
          />
          <button onClick={joinRoom} className="neo-raised py-4 font-bold text-[var(--color-primary)] active:neo-inset disabled:opacity-50" disabled={!roomId.trim()}>
            Join Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
