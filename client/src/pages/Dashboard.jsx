import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:5005';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [joinError, setJoinError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`${BASE_URL}/api/rooms`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRooms(data); })
      .catch(console.error);
  }, [user]);

  const createRoom = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
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
      alert('Could not connect to server. Is the backend running?');
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!roomId.trim()) return;
    setIsJoining(true);
    setJoinError('');
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ roomId: roomId.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/room/${data.roomId}`);
      } else {
        setJoinError(data.message || 'Failed to join room');
      }
    } catch (error) {
      setJoinError('Could not connect to server. Is the backend running?');
    } finally {
      setIsJoining(false);
    }
  };


  return (
    <div className="bg-surface text-on-surface font-body antialiased min-h-screen flex">
      {/* SideNavBar */}
      <nav className="bg-[#020617] h-screen w-72 flex flex-col p-6 sticky top-0 left-0 z-40 shadow-neo dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-4px_-4px_16px_rgba(255,255,255,0.05)] text-slate-300">
        <div className="mb-10 pl-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[#EAB308] font-headline">SilkCode</h1>
          <p className="text-slate-400 text-sm mt-1">Coding Sandbox</p>
        </div>
        
        <div className="flex-1 space-y-2">
          {/* Active Tab: Dashboard */}
          <a className="shadow-none bg-slate-900/50 text-[#EAB308] rounded-xl flex items-center gap-3 px-4 py-3 font-['Plus_Jakarta_Sans'] font-medium text-sm border-l-4 border-[#EAB308]" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            Dashboard
          </a>
          <a className="text-slate-400 flex items-center gap-3 px-4 py-3 hover:text-[#EAB308] transition-all hover:bg-slate-900 rounded-xl active:scale-[0.97] transition-transform duration-200 font-['Plus_Jakarta_Sans'] font-medium text-sm" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">database</span>
            Question Bank
          </a>
          <a className="text-slate-400 flex items-center gap-3 px-4 py-3 hover:text-[#EAB308] transition-all hover:bg-slate-900 rounded-xl active:scale-[0.97] transition-transform duration-200 font-['Plus_Jakarta_Sans'] font-medium text-sm" href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </a>
        </div>
        
        <div className="mt-auto pt-6">
          <button onClick={createRoom} className="w-full neo-raised bg-surface text-primary rounded-xl py-3 px-4 font-semibold text-sm flex items-center justify-center gap-2 neo-pressed transition-all">
            <span className="material-symbols-outlined">add</span>
            Start New Session
          </button>
          <div className="mt-6 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full neo-raised flex items-center justify-center bg-surface text-primary">
               {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-on-surface">{user?.name || 'Guest'}</span>
              <span className="text-xs text-on-surface-variant">{user?.role || 'User'}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold font-headline text-on-surface">Welcome back, {user?.name?.split(' ')[0] || 'User'}.</h2>
            <p className="text-on-surface-variant mt-2">Here's what's happening today.</p>
          </div>
          <div className="flex gap-4">
            <button className="w-12 h-12 rounded-full bg-surface neo-raised flex items-center justify-center text-on-surface-variant active:neo-pressed transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-surface neo-raised flex items-center justify-center text-on-surface-variant active:neo-pressed transition-all">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats Column (Left) */}
          <div className="col-span-1 flex flex-col gap-8">
            {/* Stat Card 1 */}
            <div className="bg-surface rounded-xl p-6 neo-raised">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-surface neo-inset flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <h3 className="font-semibold text-on-surface">Interviews Conducted</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold font-headline text-primary">12</span>
                <span className="text-sm text-tertiary mb-1 font-medium">+1 this week</span>
              </div>
            </div>
            
            {/* Stat Card 2 */}
            <div className="bg-surface rounded-xl p-6 neo-raised">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-surface neo-inset flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">task_alt</span>
                </div>
                <h3 className="font-semibold text-on-surface">Problems Solved</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold font-headline text-primary">85</span>
                <span className="text-sm text-tertiary mb-1 font-medium">+4 today</span>
              </div>
            </div>
          </div>

          {/* Actions Column (Middle & Right) */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Create Room CTA */}
              <div className="bg-surface rounded-xl p-8 neo-raised flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-surface neo-raised mb-6 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add_to_queue</span>
                </div>
                <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">Create a Room</h3>
                <p className="text-sm text-on-surface-variant mb-6">Start a new live coding session instantly.</p>
                <button onClick={createRoom} disabled={isCreating} className="bg-surface text-primary neo-raised rounded-xl py-3 px-8 font-semibold w-full active:neo-pressed transition-all disabled:opacity-60">
                  {isCreating ? 'Creating...' : 'New Room'}
                </button>
              </div>

              {/* Join Room Action */}
              <div className="bg-surface rounded-xl p-8 neo-raised flex flex-col justify-center">
                <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">Join Session</h3>
                <p className="text-sm text-on-surface-variant mb-6">Enter a room code to join an ongoing interview.</p>
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">vpn_key</span>
                    <input 
                       value={roomId}
                       onChange={(e) => { setRoomId(e.target.value); setJoinError(''); }}
                       onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                       className="w-full bg-surface border-none rounded-xl py-4 pl-12 pr-4 neo-inset text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 outline-none" 
                       placeholder="Enter Room Code..." 
                       type="text"
                    />
                  </div>
                  {joinError && <p className="text-xs text-error font-medium">{joinError}</p>}
                  <button onClick={joinRoom} disabled={!roomId.trim() || isJoining} className="bg-surface text-primary neo-raised rounded-xl py-3 px-8 font-semibold w-full active:neo-pressed transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isJoining ? 'Joining...' : 'Join Now'}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Recent Activity List */}
            <div className="bg-surface rounded-xl p-8 neo-raised flex-1">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-headline text-on-surface">Upcoming Interviews</h3>
                <button className="text-sm font-semibold text-primary hover:text-tertiary transition-colors">View All</button>
              </div>
              <div className="space-y-4">
                {/* Item 1 */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface neo-inset cursor-pointer hover:opacity-80">
                  <div className="flex items-center gap-4">
                    <img alt="Candidate" className="w-10 h-10 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC-oFS4U8BcLGsUd7EEvn5otxXIC82KPcNueiXH2uzUv2_UJJNh_y28UHfwqu8rgTgKj-Cqi8zqLcTgkyMiyLxtQ-v-m6OiB886asW_BXn2pHqacB4Od92e53p44gLv-yAO27QjlAI76eH99sNYG3TQ3GQt94ZEWxRKSKB5ZsJ0gKP7s_zznUpO0fcy7Jmz45ZjJTzCx7iswDz2CL0aKMVYjFazQds11RiCx6Oa46D8VRdJAnZBQaKaGQv7GKvvoCyXzj9KZQnaGU"/>
                    <div>
                      <h4 className="font-semibold text-on-surface text-sm">Sarah Jenkins</h4>
                      <p className="text-xs text-on-surface-variant">Frontend Developer Role</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">10:00 AM</p>
                    <p className="text-xs text-on-surface-variant">Today</p>
                  </div>
                </div>
                {/* Item 2 */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface neo-inset cursor-pointer hover:opacity-80">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface neo-raised flex items-center justify-center text-on-surface-variant font-bold text-sm">
                        MK
                    </div>
                    <div>
                      <h4 className="font-semibold text-on-surface text-sm">Michael Kim</h4>
                      <p className="text-xs text-on-surface-variant">Backend Engineer Role</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">2:30 PM</p>
                    <p className="text-xs text-on-surface-variant">Today</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
