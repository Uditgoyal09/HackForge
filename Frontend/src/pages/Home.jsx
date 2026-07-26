import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import './Home.css';

const UPCOMING_EVENTS = [
  { id: 1, title: 'React Workshop', date: 'August 10, 2026', type: 'Workshop' },
  { id: 2, title: 'Pitch Deck Masterclass', date: 'August 15, 2026', type: 'Webinar' },
  { id: 3, title: 'HackForge Meetup', date: 'August 22, 2026', type: 'Networking' },
];

const STATS = [
  { label: 'Active Hackathons', value: '45+' },
  { label: 'Global Participants', value: '12,000+' },
  { label: 'Projects Submitted', value: '3,500+' },
  { label: 'Prize Money Distributed', value: '$2.5M+' },
];

const Home = () => {
  const [featuredHackathons, setFeaturedHackathons] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/hackathons');
        if (response.ok) {
          const data = await response.json();
          // Take the top 3 most recent hackathons for the featured section
          setFeaturedHackathons(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching hackathons:', error);
      }
    };
    fetchHackathons();
  }, []);
  return (
    <div className="home-container">
      <Hero />
      
      {/* Stats Section */}
      <section className="stats-section">
        <div className="section-container stats-grid">
          {STATS.map((stat, idx) => (
            <div key={idx} className="stat-card glass">
              <h3 className="stat-value text-gradient">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Hackathons */}
      <section className="featured-section">
        <div className="section-container">
          <h2 className="section-title">Featured <span className="text-gradient">Hackathons</span></h2>
          <div className="cards-grid">
            {featuredHackathons.length > 0 ? (
              featuredHackathons.map(hackathon => (
                <div key={hackathon._id} className="hackathon-card glass">
                  <div className="card-badge">{hackathon.status || 'Active'}</div>
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
              ))
            ) : (
              <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No hackathons available yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Why Participate */}
      <section className="why-section">
        <div className="section-container">
          <h2 className="section-title">Why <span className="text-gradient">Participate?</span></h2>
          <div className="cards-grid">
            <div className="feature-card glass">
              <div className="feature-icon">🚀</div>
              <h3>Launch Your Career</h3>
              <p>Build real-world projects that stand out on your resume and impress top recruiters.</p>
            </div>
            <div className="feature-card glass">
              <div className="feature-icon">🤝</div>
              <h3>Global Networking</h3>
              <p>Connect with industry experts, mentors, and talented developers from around the world.</p>
            </div>
            <div className="feature-card glass">
              <div className="feature-icon">🏆</div>
              <h3>Win Big Prizes</h3>
              <p>Compete for cash prizes, exclusive internships, and premium software licenses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="events-section">
        <div className="section-container">
          <h2 className="section-title">Upcoming <span className="text-gradient">Events</span></h2>
          <div className="events-list">
            {UPCOMING_EVENTS.map(event => (
              <div key={event.id} className="event-item glass">
                <div className="event-date">
                  <span className="text-gradient">{event.date.split(',')[0]}</span>
                  <small>{event.date.split(',')[1]}</small>
                </div>
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <span className="event-type">{event.type}</span>
                </div>
                <Link to="/login" className="btn btn-primary">Register</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer glass">
        <div className="section-container footer-content">
          <div className="footer-brand">
            <h2 className="navbar-logo"><span className="logo-icon">▲</span> HackForge</h2>
            <p>The ultimate platform for hosting and participating in world-class hackathons.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Platform</h4>
              <a href="#">Hackathons</a>
              <a href="#">Events</a>
              <a href="#">Leaderboard</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div>
              <h4>Legal</h4>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 HackForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
