import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <footer className="py-8 text-center text-sm text-text-secondary border-t border-border mt-auto">
        &copy; {new Date().getFullYear()} HackForge. All rights reserved.
      </footer>
    </div>
  );
};
