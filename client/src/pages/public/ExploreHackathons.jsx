import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Trophy, Users, ArrowRight, X } from 'lucide-react';
import { hackathonService } from '../../services/hackathonService';

const ExploreHackathons = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [mode, setMode] = useState(searchParams.get('mode') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [hackathons, setHackathons] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Debounced sync to URL parameters and API call
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = {};
      if (search) params.search = search;
      if (mode) params.mode = mode;
      if (status) params.status = status;
      if (page > 1) params.page = page;

      setSearchParams(params);
      fetchHackathons();
    }, 300);

    return () => clearTimeout(handler);
  }, [search, mode, status, page]);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const query = {
        page,
        limit: 6,
        search: search || undefined,
        mode: mode || undefined,
        status: status || undefined,
      };
      const res = await hackathonService.getHackathons(query);
      if (res.success && res.data) {
        setHackathons(res.data);
        setTotalPages(res.pagination?.pages || 1);
      }
    } catch {
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setMode('');
    setStatus('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Explore Hackathons</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Filter through upcoming, ongoing, and completed competitions worldwide.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-6 mb-10 backdrop-blur-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search hackathons by title, theme, or keyword..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Mode Select */}
            <div className="sm:col-span-3">
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">All Modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline / In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="sm:col-span-3">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {(search || mode || status) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-xs">
              <span className="text-slate-400">Active filters applied</span>
              <button
                onClick={handleClearFilters}
                className="text-rose-400 hover:underline flex items-center gap-1 font-medium"
              >
                <X className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Hackathon Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-300">No Hackathons Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
              We couldn't find any hackathons matching your criteria. Try adjusting your search or filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hackathons.map((h) => (
              <div
                key={h._id}
                className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold uppercase">
                      {h.mode || 'Online'}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      ${h.prizePool?.toLocaleString() || '0'} Prize Pool
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors mb-2">
                    {h.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {h.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/50">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Start Date:
                    </span>
                    <span className="font-medium text-slate-300">
                      {new Date(h.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/30">
                    <span className="text-[11px] text-slate-500">
                      Max Team: {h.maxTeamSize} Members
                    </span>
                    <Link
                      to={`/hackathons/${h._id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      View Event <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400 font-mono px-3">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreHackathons;
