import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Trophy, Users, ArrowRight, X } from 'lucide-react';
import { hackathonService } from '../../services/hackathonService';
import HackathonCard from '../../components/public/HackathonCard';
import HackathonCardSkeleton from '../../components/public/HackathonCardSkeleton';

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
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Explore Hackathons</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Filter through upcoming, ongoing, and completed competitions worldwide.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-4 sm:p-6 mb-10 backdrop-blur-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search hackathons by title, theme, or keyword..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-background/80 border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
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
                className="w-full px-4 py-2.5 bg-background/80 border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="" className="bg-background text-foreground">All Modes</option>
                <option value="online" className="bg-background text-foreground">Online</option>
                <option value="offline" className="bg-background text-foreground">Offline / In-Person</option>
                <option value="hybrid" className="bg-background text-foreground">Hybrid</option>
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
                className="w-full px-4 py-2.5 bg-background/80 border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="" className="bg-background text-foreground">All Statuses</option>
                <option value="upcoming" className="bg-background text-foreground">Upcoming</option>
                <option value="ongoing" className="bg-background text-foreground">Ongoing</option>
                <option value="completed" className="bg-background text-foreground">Completed</option>
              </select>
            </div>
          </div>

          {(search || mode || status) && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
              <span className="text-muted-foreground">Active filters applied</span>
              <button
                onClick={handleClearFilters}
                className="text-error hover:underline flex items-center gap-1 font-medium"
              >
                <X className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Hackathon Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <HackathonCardSkeleton key={i} />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 border border-border rounded-[var(--radius-lg)] p-8 backdrop-blur-sm">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="font-bold text-lg text-foreground">No Hackathons Found</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto mb-6">
              We couldn't find any hackathons matching your criteria. Try adjusting your search or filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold transition-all shadow-lg shadow-primary/20"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((h, i) => (
              <motion.div
                key={h._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <HackathonCard hackathon={h} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-[var(--radius-md)] bg-surface-elevated border border-border text-xs font-semibold text-foreground hover:bg-surface-hover disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground font-mono px-3">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-[var(--radius-md)] bg-surface-elevated border border-border text-xs font-semibold text-foreground hover:bg-surface-hover disabled:opacity-40"
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
