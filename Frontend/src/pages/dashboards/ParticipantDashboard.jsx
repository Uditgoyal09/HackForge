import React from 'react';
import './Dashboard.css';

const ParticipantDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Participant Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back, {user?.name}. Ready to hack?</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card glass">
          <h2 className="card-title">🚀 My Hackathons</h2>
          <p className="card-content">You are not currently registered for any hackathons. Explore upcoming events to join one!</p>
        </div>
        <div className="dashboard-card glass">
          <h2 className="card-title">📁 My Submissions</h2>
          <p className="card-content">No project submissions yet. Start building something amazing.</p>
        </div>
        <div className="dashboard-card glass">
          <h2 className="card-title">🤝 Find a Team</h2>
          <p className="card-content">Looking for teammates? Browse profiles and connect with other developers.</p>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
