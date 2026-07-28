import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-6 lg:px-12"
    >
      <Link to="/" className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors">
        <Terminal className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl tracking-tight">HackVerse</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <Link to="/hackathons" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Explore</Link>
        <Link to="/leaderboard" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Leaderboard</Link>
        <Link to="/projects" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Projects</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/login">
          <Button variant="ghost" size="sm">Login</Button>
        </Link>
        <Link to="/signup">
          <Button variant="primary" size="sm">Get Started</Button>
        </Link>
      </div>
    </motion.nav>
  );
};
