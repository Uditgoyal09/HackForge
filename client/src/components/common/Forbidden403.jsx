import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const Forbidden403 = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 text-rose-400 shadow-xl shadow-rose-500/5 animate-pulse">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <span className="text-xs font-mono tracking-widest text-rose-400 uppercase bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full mb-3">
        403 Access Denied
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
        You Don't Have Permission
      </h1>

      <p className="text-slate-400 max-w-md text-sm sm:text-base mb-8 leading-relaxed">
        This area is restricted to specific platform roles. If you believe this is an error, please switch accounts or contact the administrator.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-all shadow-lg shadow-indigo-600/25"
        >
          <Home className="w-4 h-4" /> Return Home
        </Link>
      </div>
    </div>
  );
};

export default Forbidden403;
