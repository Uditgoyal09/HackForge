import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
          <Route path="/signup" element={<Signup onLoginSuccess={setUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
