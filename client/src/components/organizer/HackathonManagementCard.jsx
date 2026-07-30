import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Code2, UsersRound, Calendar, ArrowUpRight, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import EventStatusBadge from './EventStatusBadge';
import EventProgress from './EventProgress';

const HackathonManagementCard = ({ hackathon }) => {
  const getBannerUrl = () => {
    if (hackathon.banner?.url) return hackathon.banner.url;
    // fallback gradient based on id
    const c1 = hackathon._id.substring(0, 3);
    const c2 = hackathon._id.substring(3, 6);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(hackathon.title)}&background=${c1}&color=fff&size=512`;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col sm:flex-row bg-surface rounded-[var(--radius-lg)] border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Cover Image */}
      <div className="sm:w-1/3 md:w-1/4 h-40 sm:h-auto relative overflow-hidden bg-surface-elevated border-b sm:border-b-0 sm:border-r border-border">
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent z-10" />
        <img 
          src={getBannerUrl()} 
          alt={hackathon.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 z-20">
          <EventStatusBadge status={hackathon.status} registrationStatus={hackathon.registrationStatus} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight group-hover:text-primary transition-colors">
              {hackathon.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-mono"><Calendar className="w-3.5 h-3.5" /> {new Date(hackathon.startDate).toLocaleDateString()}</span>
              <span>•</span>
              <span className="text-primary font-mono uppercase">{hackathon.mode}</span>
            </div>
          </div>
          <Link 
            to={`/organizer/hackathons/${hackathon._id}/edit`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-surface border border-border hover:bg-surface-hover text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="mb-6 max-w-sm w-full">
          <EventProgress hackathon={hackathon} />
        </div>

        {/* Quick Stats & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <Link to={`/organizer/hackathons/${hackathon._id}/registrations`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group/stat">
              <Users className="w-4 h-4 group-hover/stat:text-primary" />
              <span className="text-sm font-semibold">Apps</span>
            </Link>
            <Link to={`/organizer/hackathons/${hackathon._id}/teams`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group/stat">
              <UsersRound className="w-4 h-4 group-hover/stat:text-primary" />
              <span className="text-sm font-semibold">Teams</span>
            </Link>
            <Link to={`/organizer/hackathons/${hackathon._id}/submissions`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group/stat">
              <Code2 className="w-4 h-4 group-hover/stat:text-primary" />
              <span className="text-sm font-semibold">Projects</span>
            </Link>
            <Link to={`/organizer/hackathons/${hackathon._id}/judges`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group/stat">
              <Scale className="w-4 h-4 group-hover/stat:text-primary" />
              <span className="text-sm font-semibold">Judges</span>
            </Link>
          </div>
          
          <Link 
            to={`/organizer/hackathons/${hackathon._id}/edit`}
            className="sm:hidden px-4 py-2 w-full text-center rounded-[var(--radius-md)] bg-surface border border-border hover:bg-surface-hover text-xs font-semibold text-foreground transition-colors"
          >
            Manage Event
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default HackathonManagementCard;
