import React from 'react';

const AuthLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Glow ambient backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-xl shadow-indigo-500/20 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              HV
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <p className="text-sm font-medium text-slate-400 tracking-wider uppercase">
            Restoring Session...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
