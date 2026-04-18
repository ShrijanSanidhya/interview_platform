import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Summary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Mock data for summary
  const mockResults = {
    timeTaken: '45m 12s',
    testCasesPassed: 8,
    totalTestCases: 10,
    attempts: 3
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center bg-[var(--color-background)]">
      <div className="neo-raised p-12 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-8 text-center">Interview Summary</h1>
        
        <div className="flex flex-col gap-6 text-[var(--color-on-background)] mb-8">
          <div className="flex justify-between items-center neo-inset p-4">
             <span className="font-semibold text-lg text-[var(--color-on-surface-variant)]">Room ID</span>
             <span className="font-mono text-[var(--color-primary)]">{id}</span>
          </div>
          <div className="flex justify-between items-center neo-inset p-4">
             <span className="font-semibold text-lg text-[var(--color-on-surface-variant)]">Role</span>
             <span className="font-bold">{user.role}</span>
          </div>
          <div className="flex justify-between items-center neo-inset p-4">
             <span className="font-semibold text-lg text-[var(--color-on-surface-variant)]">Time Taken</span>
             <span className="font-bold">{mockResults.timeTaken}</span>
          </div>
          <div className="flex justify-between items-center neo-inset p-4">
             <span className="font-semibold text-lg text-[var(--color-on-surface-variant)]">Test Cases</span>
             <span className="font-bold text-green-600">{mockResults.testCasesPassed} / {mockResults.totalTestCases}</span>
          </div>
        </div>

        <div className="flex justify-center">
            <button onClick={() => navigate('/dashboard')} className="neo-raised px-8 py-4 text-lg font-bold text-[var(--color-primary)] active:neo-inset">
              Back to Dashboard
            </button>
        </div>
      </div>
    </div>
  );
};

export default Summary;
