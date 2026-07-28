import React, { useState, useEffect } from 'react';
import { FolderGit2, ExternalLink, Search, Layers } from 'lucide-react';
import { GithubIcon } from '../../components/common/SocialIcons';
import api from '../../services/api';

const PublicProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPublicProjects = async () => {
      setLoading(true);
      try {
        // Fetch public submissions endpoint or sample endpoint
        const res = await api.get('/submissions/public');
        if (res.data?.success) {
          setProjects(res.data.data || []);
        }
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProjects();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    p.techStack?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Public Project Gallery</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Explore innovative solutions and open-source applications built on HackVerse.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search projects by name or technology (e.g. React, Solidity)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8 max-w-md mx-auto">
            <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-300">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Projects will appear here once hackathon submissions are published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProjects.map((p) => (
              <div
                key={p._id}
                className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">{p.projectName}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {p.solution || p.problemStatement}
                  </p>

                  {/* Tech Stack Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.techStack?.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-indigo-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  {p.githubRepository && (
                    <a
                      href={p.githubRepository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5" /> Repository
                    </a>
                  )}

                  {p.liveDemoUrl && (
                    <a
                      href={p.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      Live Demo <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProjects;
