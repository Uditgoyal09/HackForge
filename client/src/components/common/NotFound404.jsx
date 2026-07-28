import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Home, Search } from 'lucide-react';

const NotFound404 = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 shadow-xl shadow-indigo-500/5">
        <Terminal className="w-10 h-10" />
      </div>

      <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-3">
        404 Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
        Lost in Code Space?
      </h1>

      <p className="text-slate-400 max-w-md text-sm sm:text-base mb-8 leading-relaxed">
        The route you are trying to reach does not exist or has been moved. Explore hackathons or return to the main dashboard.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/hackathons"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-medium transition-all"
        >
          <Search className="w-4 h-4" /> Explore Hackathons
        </Link>

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

export default NotFound404;
