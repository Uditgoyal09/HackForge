import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, Search } from 'lucide-react';
import { submissionService } from '../../services/submissionService';
import ProjectCard from '../../components/public/ProjectCard';
import ProjectCardSkeleton from '../../components/public/ProjectCardSkeleton';

const PublicProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPublicProjects = async () => {
      setLoading(true);
      try {
        // Fetch public submissions using the hybrid service
        const res = await submissionService.getPublicProjects();
        if (res?.success) {
          setProjects(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch public projects:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    const title = p.projectName || p.title || '';
    const stack = p.techStack || p.technologies || [];
    return title.toLowerCase().includes(search.toLowerCase()) ||
           stack.some(t => t.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 selection:bg-primary/30 selection:text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Public <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">Project Gallery</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">
              Explore innovative solutions and open-source applications built by the HackVerse community.
            </p>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto mb-16 relative z-10"
        >
          <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name or technology (e.g. React, Solidity)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface/50 backdrop-blur-md border border-border rounded-2xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-lg"
          />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-surface/30 border border-border rounded-3xl p-8 max-w-md mx-auto backdrop-blur-sm relative z-10"
          >
            <FolderGit2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-lg text-foreground mb-2">No Projects Found</h3>
            <p className="text-sm text-muted-foreground">
              {search ? "No projects match your search criteria." : "Projects will appear here once hackathon submissions are published."}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-6 px-6 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold transition-all shadow-[0_0_15px_rgba(182,255,0,0.3)]"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {filteredProjects.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProjects;
