import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Hackathons.css';

const Hackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Fetch hackathons from backend
    const fetchHackathons = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/hackathons');
        if (response.ok) {
          const data = await response.json();
          setHackathons(data);
        } else {
          console.error('Failed to fetch hackathons');
        }
      } catch (error) {
        console.error('Error fetching hackathons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  if (loading) {
    return (
      <div className="hackathons-container loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="hackathons-container">
      <div className="hackathons-header">
        <h1 className="page-title">Explore <span className="text-gradient">Hackathons</span></h1>
        <p className="page-subtitle">Find the perfect hackathon to showcase your skills, build amazing projects, and win prizes.</p>
      </div>

      <div className="hackathons-grid">
        {hackathons.length > 0 ? (
          hackathons.map(hackathon => (
            <div key={hackathon._id} className="hackathon-card glass">
              <div className="card-badge">{hackathon.status || 'Active'}</div>
              {hackathon.bannerImage && (
                <div className="card-image-wrapper">
                  <img src={`http://localhost:5000${hackathon.bannerImage}`} alt={hackathon.title} className="card-image" />
                </div>
              )}
              <div className="card-content">
                <h3 className="card-title">{hackathon.title}</h3>
                <p className="card-theme">Theme: {hackathon.theme || 'Open Innovation'}</p>
                <div className="card-footer">
                  <span className="card-prize">{hackathon.prizePool || 'TBA'} Prize Pool</span>
                  <span className="card-participants">{hackathon.mode || 'online'} Mode</span>
                </div>
                {user ? (
                  <Link to={`/hackathons/${hackathon._id}`} className="btn btn-outline card-btn">Participate</Link>
                ) : (
                  <Link to="/login" className="btn btn-outline card-btn">Login to Participate</Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state glass">
            <h2>No Hackathons Available</h2>
            <p>Check back later for exciting new events!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hackathons;
