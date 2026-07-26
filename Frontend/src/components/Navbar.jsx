import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">▲</span> HackForge
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/hackathons" className="nav-links">Hackathons</Link>
          </li>
          <li className="nav-item">
            <a href="#events" className="nav-links">Events</a>
          </li>
          <li className="nav-item">
            <a href="#leaderboard" className="nav-links">Leaderboard</a>
          </li>
          <li className="nav-item">
            <a href="#about" className="nav-links">About</a>
          </li>
        </ul>
        
        <div className="nav-buttons">
          {user ? (
            <div className="user-profile">
              <Link to={`/${user.role}-dashboard`} className="nav-links">Dashboard</Link>
              <span className="user-greeting">Hi, {user.name}</span>
              <button onClick={onLogout} className="btn btn-outline">Log Out</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Log In</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
