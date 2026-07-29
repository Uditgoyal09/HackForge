import React from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, Users, Trophy, Activity } from 'lucide-react';
import MetricCard from './MetricCard';

const DashboardAnalytics = ({ analytics }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <motion.div variants={item}>
        <MetricCard
          title="Total Hackathons"
          value={analytics?.myHackathons || 0}
          icon={FolderGit2}
          subtitle="Active & Draft events"
        />
      </motion.div>
      <motion.div variants={item}>
        <MetricCard
          title="Total Registrations"
          value={analytics?.totalRegistrations || 0}
          icon={Users}
          subtitle={analytics?.pendingRegistrations > 0 ? `${analytics.pendingRegistrations} pending review` : "All processed"}
        />
      </motion.div>
      <motion.div variants={item}>
        <MetricCard
          title="Active Teams"
          value={analytics?.activeTeams || 0}
          icon={Activity}
          subtitle="Formed & active"
        />
      </motion.div>
      <motion.div variants={item}>
        <MetricCard
          title="Project Submissions"
          value={analytics?.projectSubmissions || 0}
          icon={Trophy}
          subtitle="Across all events"
        />
      </motion.div>
    </motion.div>
  );
};

export default DashboardAnalytics;
