import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';

const StatusIndicator = ({ status }) => {
  if (status === 'registration_open' || status === 'ongoing') {
    return (
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
          {status === 'ongoing' ? 'Live' : 'Registration Open'}
        </span>
      </div>
    );
  }
  
  if (status === 'upcoming') {
    return (
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Upcoming</span>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
      <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
    </div>
  );
};

const HackathonCard = ({ hackathon }) => {
  const fallbackImage = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800";
  const imageToUse = hackathon.imageUrl || fallbackImage;

  return (
    <div className="group relative flex flex-col h-full bg-surface border border-border hover:border-border-hover rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      
      {/* Image Container with Zoom Effect */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-elevated">
        <StatusIndicator status={hackathon.status} />
        
        {hackathon.featured && (
          <div className="absolute top-4 right-4 z-20">
            <Badge variant="primary" className="bg-primary/90 text-primary-foreground border-none shadow-lg">Featured</Badge>
          </div>
        )}

        <img 
          src={imageToUse} 
          alt={hackathon.title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.target.src = fallbackImage }}
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90 z-10" />
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow p-6 pt-2 relative z-20 -mt-8">
        
        {/* Category & Mode */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase border border-primary/20">
            {hackathon.category || 'Open Innovation'}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            • {hackathon.mode || 'Online'}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors mb-2 leading-tight">
          {hackathon.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-grow">
          {hackathon.shortDescription || hackathon.description}
        </p>

        {/* Tech Tags */}
        {hackathon.technologies && hackathon.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {hackathon.technologies.slice(0, 3).map((tech, i) => (
              <span key={i} className="text-[10px] text-foreground bg-surface-elevated px-2 py-0.5 rounded-full border border-border">
                {tech}
              </span>
            ))}
            {hackathon.technologies.length > 3 && (
              <span className="text-[10px] text-muted-foreground bg-surface px-2 py-0.5 rounded-full border border-border">
                +{hackathon.technologies.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5" title="Start Date">
              <Calendar className="w-3.5 h-3.5" /> 
              {new Date(hackathon.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5" title="Participants">
              <Users className="w-3.5 h-3.5" /> 
              {hackathon.participantCount || 0}
            </span>
          </div>
          
          <div className="font-semibold text-foreground">
            ${hackathon.prizePool?.toLocaleString() || '0'}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <Link 
            to={`/hackathons/${hackathon.slug || hackathon._id}`}
            className="w-full py-2.5 rounded-[var(--radius-md)] bg-surface-elevated hover:bg-primary/10 border border-border hover:border-primary/30 text-sm font-semibold text-foreground hover:text-primary transition-all flex items-center justify-center gap-2 group/btn"
          >
            View Event 
            <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HackathonCard;
