import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';

const AttentionPanel = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-error/5 rounded-[var(--radius-lg)] border border-error/20 p-6 shadow-lg shadow-error/5 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 rounded-full blur-3xl" />
      <h3 className="text-sm font-semibold text-error mb-4 flex items-center gap-2 relative z-10">
        <AlertTriangle className="w-4 h-4" /> Needs Attention
      </h3>
      <div className="space-y-3 relative z-10">
        {items.map((item) => (
          <Link 
            key={item.id} 
            to={item.actionUrl}
            className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-error/5 border border-error/10 hover:bg-error/10 transition-colors group"
          >
            <span className="text-sm text-foreground">{item.message}</span>
            <ArrowRight className="w-4 h-4 text-error group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AttentionPanel;
