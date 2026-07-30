import { Outlet, Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-text-primary hover:text-accent transition-colors">
          <Terminal className="h-8 w-8 text-primary" />
          <span className="font-bold text-3xl tracking-tight">HackForge</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Outlet />
      </div>
    </div>
  );
};
