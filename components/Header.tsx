
import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, setMode }) => {
  return (
    <nav className="bg-slate-900/95 backdrop-blur-md text-white p-4 sticky top-0 z-[60] shadow-2xl border-b border-white/5">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setMode(AppMode.HOME)}
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center font-black text-sm shadow-lg group-hover:rotate-12 transition-transform">L</div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">DriveTheory</h1>
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Master Edition</span>
          </div>
        </div>
        
        <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
          {[
            { mode: AppMode.HOME, label: 'Store' },
            { mode: AppMode.PRACTICE, label: 'Practice' },
            { mode: AppMode.MOCK_TEST, label: 'Exam' },
            { mode: AppMode.DASHBOARD, label: 'Stats' }
          ].map(({ mode, label }) => (
            <button 
              key={mode}
              onClick={() => setMode(mode)}
              className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                currentMode === mode 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
