import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const OrganizerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyHackathons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/hackathons/organizer/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHackathons(data);
      } else {
        setError('Failed to fetch your hackathons.');
      }
    } catch (err) {
      setError('An error occurred while fetching your hackathons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHackathons();
  }, []);

  const toggleRegistration = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('registrationOpen', !currentStatus);

      const response = await fetch(`http://localhost:5000/api/hackathons/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        // Refresh list
        fetchMyHackathons();
      } else {
        alert('Failed to toggle registration status');
      }
    } catch (err) {
      console.error(err);
      alert('Error toggling registration status');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="dashboard-title">Organizer Dashboard</h1>
          <p className="dashboard-subtitle">Welcome, {user?.name}. Manage your events.</p>
        </div>
        <Link to="/create-hackathon" className="btn btn-primary">Create Hackathon</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="dashboard-grid">
        <div className="dashboard-card glass" style={{ gridColumn: '1 / -1' }}>
          <h2 className="card-title">📅 My Hackathons</h2>
          
          {hackathons.length === 0 ? (
            <p className="card-content">You currently have 0 active hackathons. Create your first event to get started.</p>
          ) : (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {hackathons.map(hack => (
                <div key={hack._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.25rem' }}>{hack.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      {new Date(hack.startDate).toLocaleDateString()} - {new Date(hack.endDate).toLocaleDateString()}
                    </p>
                    <span style={{ 
                      display: 'inline-block', 
                      marginTop: '0.5rem', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.8rem', 
                      background: hack.registrationOpen ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: hack.registrationOpen ? '#22c55e' : '#ef4444' 
                    }}>
                      Registration {hack.registrationOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => toggleRegistration(hack._id, hack.registrationOpen)} 
                      className="btn btn-outline" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      {hack.registrationOpen ? 'Close Registration' : 'Open Registration'}
                    </button>
                    
                    <button 
                      onClick={() => navigate(`/edit-hackathon/${hack._id}`)} 
                      className="btn btn-outline" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderColor: '#6366f1', color: '#6366f1' }}>
                      Edit
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
