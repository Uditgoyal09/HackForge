import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Build. Compete. <span className="text-gradient-primary">Innovate.</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
          The ultimate platform for hackathon organizers, participants, and judges. 
          Manage your entire hackathon lifecycle in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" variant="primary">Explore Hackathons</Button>
          <Button size="lg" variant="secondary">Host a Hackathon</Button>
        </div>
      </motion.div>
    </div>
  );
};
