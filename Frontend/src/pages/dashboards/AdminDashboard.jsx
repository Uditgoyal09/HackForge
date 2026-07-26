import React from 'react';
import './Dashboard.css';

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">System overview and control panel. Authenticated as {user?.name}.</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card glass">
          <h2 className="card-title">🌍 Platform Metrics</h2>
          <p className="card-content" style={{lineHeight: '2'}}>
            <strong>Total Users:</strong> 1,024<br/>
            <strong>Active Hackathons:</strong> 12<br/>
            <strong>Total Submissions:</strong> 340
          </p>
        </div>
        <div className="dashboard-card glass">
          <h2 className="card-title">🛡️ User Management</h2>
          <p className="card-content">Review reported accounts, manage roles, and monitor system activity.</p>
        </div>
        <div className="dashboard-card glass">
          <h2 className="card-title">⚙️ System Settings</h2>
          <p className="card-content">Configure global platform variables and integrations.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
