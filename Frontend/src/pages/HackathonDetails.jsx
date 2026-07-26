import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Hackathons.css'; // Reuse existing CSS, or we can add specifics here

const HackathonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchHackathonDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/hackathons/${id}`);
        if (response.ok) {
          const data = await response.json();
          setHackathon(data);
        } else {
          setError('Hackathon not found');
        }
      } catch (err) {
        setError('Error loading hackathon details');
      } finally {
        setLoading(false);
      }
    };

    const checkStatus = async () => {
      if (user && user.role === 'participant') {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/registrations/check/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.isRegistered) {
              setRegistrationStatus(data.status);
            }
          }
        } catch (err) {
          console.error('Error checking registration status', err);
        }
      }
    };

    fetchHackathonDetails();
    checkStatus();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'participant') {
      alert('Only participants can register for hackathons.');
      return;
    }

    setRegistering(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5000/api/registrations/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRegistrationStatus('approved');
      } else {
        alert(data.message || 'Failed to register');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during registration.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="hackathons-container loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="hackathons-container">
        <div className="empty-state glass">
          <h2>{error || 'Not Found'}</h2>
          <button onClick={() => navigate('/hackathons')} className="btn btn-primary" style={{marginTop: '1rem'}}>Back to Explore</button>
        </div>
      </div>
    );
  }

  return (
    <div className="hackathons-container">
      <div className="details-header glass" style={{ padding: '3rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>{hackathon.title}</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem' }}>Organized by {hackathon.organizer?.name || 'Unknown'}</p>
        
        <div className="details-meta" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div>
            <strong style={{ color: '#ffffff' }}>Theme</strong>
            <p style={{ color: '#a5b4fc' }}>{hackathon.theme}</p>
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Mode</strong>
            <p style={{ color: '#a5b4fc' }}>{hackathon.mode}</p>
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Prize Pool</strong>
            <p style={{ color: '#a5b4fc' }}>{hackathon.prizePool}</p>
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Max Team Size</strong>
            <p style={{ color: '#a5b4fc' }}>{hackathon.maxTeamSize} Members</p>
          </div>
        </div>

        {registrationStatus ? (
          <button className="btn btn-outline" disabled style={{ borderColor: '#22c55e', color: '#22c55e' }}>
            {registrationStatus === 'pending' ? 'Registration Pending' : '✓ Registered'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleRegister} disabled={registering}>
            {registering ? 'Registering...' : 'Register Now'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>Description</h2>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
            {hackathon.description}
          </p>

          {hackathon.rules && (
            <>
              <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>Rules</h2>
              <p style={{ color: '#94a3b8', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {hackathon.rules}
              </p>
            </>
          )}
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1.5rem' }}>Timeline</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block' }}>Registration Deadline</strong>
            <span style={{ color: '#ffffff' }}>{new Date(hackathon.registrationDeadline).toLocaleDateString()}</span>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block' }}>Hackathon Starts</strong>
            <span style={{ color: '#ffffff' }}>{new Date(hackathon.startDate).toLocaleDateString()}</span>
          </div>
          
          <div>
            <strong style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block' }}>Hackathon Ends</strong>
            <span style={{ color: '#ffffff' }}>{new Date(hackathon.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetails;
