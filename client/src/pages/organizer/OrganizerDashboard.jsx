import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Components
import OrganizerDashboardHeader from '../../components/organizer/OrganizerDashboardHeader';
import DashboardAnalytics from '../../components/organizer/DashboardAnalytics';
import PerformanceChart from '../../components/organizer/PerformanceChart';
import HackathonManagementCard from '../../components/organizer/HackathonManagementCard';
import DashboardEmptyState from '../../components/organizer/DashboardEmptyState';
import OrganizerActivity from '../../components/organizer/OrganizerActivity';
import UpcomingDeadlines from '../../components/organizer/UpcomingDeadlines';
import QuickActions from '../../components/organizer/QuickActions';
import AttentionPanel from '../../components/organizer/AttentionPanel';
import DashboardSkeleton from '../../components/organizer/DashboardSkeleton';

const OrganizerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await dashboardService.getOrganizerAnalytics();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="pt-8 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Unable to load analytics</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          We encountered an issue while retrieving your dashboard data. Please check your connection and try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-[var(--radius-md)] bg-surface border border-border hover:bg-surface-hover text-foreground font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const hasHackathons = data.myHackathons > 0;

  return (
    <div className="min-h-screen text-foreground pb-20 pt-8 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-primary-soft selection:text-foreground relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-soft rounded-full blur-[120px]" />
      </div>

      {!hasHackathons ? (
        <DashboardEmptyState />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 relative z-10"
        >
          <OrganizerDashboardHeader />
          <AttentionPanel items={data.needsAttention} />
          <DashboardAnalytics analytics={data} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Main Left Column */}
            <div className="xl:col-span-2 space-y-8">
              <PerformanceChart trendData={data.registrationTrend} />
              
              <div className="bg-transparent">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">Your Hackathons</h3>
                  <Link to="/organizer/hackathons" className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {data.hackathons?.slice(0, 3).map((hackathon) => (
                    <HackathonManagementCard key={hackathon._id} hackathon={hackathon} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <UpcomingDeadlines deadlines={data.upcomingDeadlines} />
              <QuickActions />
              <OrganizerActivity activity={data.recentActivity} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
