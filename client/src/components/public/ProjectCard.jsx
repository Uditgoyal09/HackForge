import React from 'react';
import { ExternalLink } from 'lucide-react';
import { GithubIcon } from '../common/SocialIcons';

const ProjectCard = ({ project }) => {
  const fallbackImage = "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=800";
  const imageToUse = project.imageUrl || fallbackImage;

  return (
    <div className="group relative flex flex-col h-full bg-surface/50 backdrop-blur-sm border border-border hover:border-primary/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(182,255,0,0.15)]">
      
      {/* Image Container with Zoom Effect */}
      <div className="relative h-56 w-full overflow-hidden bg-surface-elevated">
        
        {project.featured && (
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">⭐ Featured</span>
          </div>
        )}
        
        {project.rank === 1 && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-warning/90 text-warning-foreground px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">🏆 Winner</span>
          </div>
        )}
        {project.rank === 2 && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-muted-foreground/90 text-background px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">🥈 Runner Up</span>
          </div>
        )}

        <img 
          src={imageToUse} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.target.src = fallbackImage }}
        />
        
        {/* Hover Overlay with Action Links */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center gap-4 backdrop-blur-sm">
          {project.githubUrl && (
            <a 
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-surface border border-border rounded-full text-foreground hover:text-primary hover:border-primary transition-colors"
              title="View Repository"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
          )}
          {project.demoUrl && (
            <a 
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-primary text-primary-foreground border border-primary rounded-full hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(182,255,0,0.4)]"
              title="Live Demo"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow p-6 relative z-20 bg-gradient-to-b from-surface/90 to-surface/50">
        
        {/* Category & Hackathon Name */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-primary font-mono font-bold uppercase tracking-wider">
            {project.category || 'Open Source'}
          </span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={project.hackathonName}>
            {project.hackathonName}
          </span>
        </div>

        {/* Title & Tagline */}
        <h3 className="font-bold text-xl text-foreground mb-1 leading-tight group-hover:text-primary transition-colors">
          {project.title || project.projectName}
        </h3>
        
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-grow">
          {project.tagline || project.solution || project.problemStatement}
        </p>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.techStack ? (
            project.techStack.slice(0, 4).map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] font-mono text-muted-foreground group-hover:border-primary/30 transition-colors">
                {t}
              </span>
            ))
          ) : (
            project.technologies && project.technologies.slice(0, 4).map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] font-mono text-muted-foreground group-hover:border-primary/30 transition-colors">
                {t}
              </span>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
              {project.teamName ? project.teamName.charAt(0).toUpperCase() : 'T'}
            </div>
            <span className="text-muted-foreground font-medium truncate max-w-[100px]">
              {project.teamName || 'Team'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1" title="Views">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              {project.views || 0}
            </span>
            <span className="flex items-center gap-1" title="Likes">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {project.likes || 0}
            </span>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProjectCard;
