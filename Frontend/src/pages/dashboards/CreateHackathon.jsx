import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateHackathon.css';

const CreateHackathon = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    mode: 'online',
    venue: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    prizePool: '',
    maxTeamSize: 4,
    rules: '',
    judgingCriteria: ''
  });
  
  const [bannerImage, setBannerImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setBannerImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('token');
    
    // Create form data object for file upload
    const submitData = new FormData();
    for (const key in formData) {
      submitData.append(key, formData[key]);
    }
    
    if (bannerImage) {
      submitData.append('bannerImage', bannerImage);
    }

    try {
      const response = await fetch('http://localhost:5000/api/hackathons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Do not set Content-Type, browser will automatically set it to multipart/form-data with the correct boundary
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Hackathon created successfully!');
        setTimeout(() => navigate('/hackathons'), 2000);
      } else {
        setError(data.message || 'Failed to create hackathon');
      }
    } catch (err) {
      setError('An error occurred while creating the hackathon.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-hackathon-container">
      <div className="form-card glass">
        <h2 className="form-title">Create a New <span className="text-gradient">Hackathon</span></h2>
        <p className="form-subtitle">Fill in the details below to launch your next big event.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="hackathon-form">
          <div className="form-group">
            <label>Hackathon Title*</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Global AI Hackathon 2026" />
          </div>

          <div className="form-group">
            <label>Description*</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" placeholder="Describe the hackathon..."></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Theme</label>
              <input type="text" name="theme" value={formData.theme} onChange={handleChange} placeholder="e.g., Web3, Healthcare, AI" />
            </div>
            <div className="form-group">
              <label>Mode</label>
              <select name="mode" value={formData.mode} onChange={handleChange}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {formData.mode !== 'online' && (
            <div className="form-group">
              <label>Venue Location</label>
              <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="Physical address or link" />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Start Date*</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Date*</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Registration Deadline*</label>
              <input type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prize Pool</label>
              <input type="text" name="prizePool" value={formData.prizePool} onChange={handleChange} placeholder="e.g., $50,000" />
            </div>
            <div className="form-group">
              <label>Max Team Size</label>
              <input type="number" name="maxTeamSize" value={formData.maxTeamSize} onChange={handleChange} min="1" max="10" />
            </div>
          </div>

          <div className="form-group">
            <label>Banner Image (Upload)</label>
            <input type="file" name="bannerImage" accept="image/*" onChange={handleFileChange} className="file-input" />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Launch Hackathon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHackathon;
