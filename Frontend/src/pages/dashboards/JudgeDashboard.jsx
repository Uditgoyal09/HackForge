import React from 'react';
import './Dashboard.css';

const JudgeDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Judge Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user?.name}. Evaluate projects.</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card glass">
          <h2 className="card-title">📋 Pending Evaluations</h2>
          <p className="card-content">You have 0 projects waiting for your review.</p>
        </div>
        <div className="dashboard-card glass">
          <h2 className="card-title">✅ Completed Reviews</h2>
          <p className="card-content">You have completed 0 project evaluations.</p>
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;
