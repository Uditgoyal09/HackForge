import React from 'react';
import './Dashboard.css';

const OrganizerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Organizer Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user?.name}. Manage your events.</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card glass">
          <h2 className="card-title">📅 Active Events</h2>
          <p className="card-content">You currently have 0 active hackathons. Create your first event to get started.</p>
          <button className="btn btn-primary" style={{marginTop: '1.25rem'}}>Create Hackathon</button>
        </div>
        <div className="dashboard-card glass">
          <h2 className="card-title">👥 Participants</h2>
          <p className="card-content">Overview of total registered users across all your events.</p>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
