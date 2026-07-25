import React from 'react';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="hero-section">
        <div className="hero-content">
          <div className="badge">Hackathon Management Evolved</div>
          <h1 className="hero-title">
            One Platform to <br /><span className="text-gradient">Rule Them All</span>
          </h1>
          <p className="hero-subtitle">
            A centralized ecosystem where organizers, participants, judges, and administrators can collaborate efficiently. Say goodbye to scattered forms and spreadsheets.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large">Get Started Now</button>
            <button className="btn btn-outline btn-large">Explore Features</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
