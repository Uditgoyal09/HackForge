import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">
          <span className="logo-icon">▲</span> HackForge
        </a>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="#organizers" className="nav-links">Organizers</a>
          </li>
          <li className="nav-item">
            <a href="#participants" className="nav-links">Participants</a>
          </li>
          <li className="nav-item">
            <a href="#judges" className="nav-links">Judges</a>
          </li>
          <li className="nav-item">
            <a href="#admin" className="nav-links">Admin</a>
          </li>
        </ul>
        
        <div className="nav-buttons">
          <button className="btn btn-outline">Log In</button>
          <button className="btn btn-primary">Sign Up</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
