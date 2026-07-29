import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceChart = ({ trendData }) => {
  if (!trendData || trendData.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center bg-surface rounded-[var(--radius-lg)] border border-border p-6 text-center shadow-lg">
        <div className="w-16 h-16 rounded-full bg-primary-soft border border-primary/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-foreground">Awaiting Analytics</h4>
        <p className="text-xs text-muted-foreground mt-2 max-w-xs">
          Historical registration data will appear here once users start joining your events.
        </p>
      </div>
    );
  }

  // Format data for chart
  const data = trendData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    registrations: d.count
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border shadow-xl p-3 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-sm font-bold text-primary">
            {payload[0].value} Registrations
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] bg-surface rounded-[var(--radius-lg)] border border-border p-6 shadow-lg">
      <h3 className="text-sm font-semibold text-foreground mb-6">Registration Trend</h3>
      <div className="h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={10} 
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={10} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(182, 255, 0, 0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Line 
              type="monotone" 
              dataKey="registrations" 
              stroke="#B6FF00" 
              strokeWidth={2}
              dot={{ fill: 'var(--surface)', stroke: '#B6FF00', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#B6FF00' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
