import React from 'react';

const AuthLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground relative overflow-hidden">
      {/* Glow ambient backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-gradient-to-tr from-primary to-primary-hover p-0.5 shadow-xl shadow-primary/20 animate-pulse">
          <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
            <span className="font-extrabold text-xl text-primary">
              HV
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <p className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
            Restoring Session...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
