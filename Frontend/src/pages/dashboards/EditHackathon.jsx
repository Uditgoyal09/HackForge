import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CreateHackathon.css'; // We can reuse the same CSS

const EditHackathon = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/hackathons/${id}`);
        if (response.ok) {
          const data = await response.json();
          // Format dates to YYYY-MM-DD for the input fields
          const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';
          
          setFormData({
            title: data.title || '',
            description: data.description || '',
            theme: data.theme || '',
            mode: data.mode || 'online',
            venue: data.venue || '',
            startDate: formatDate(data.startDate),
            endDate: formatDate(data.endDate),
            registrationDeadline: formatDate(data.registrationDeadline),
            prizePool: data.prizePool || '',
            maxTeamSize: data.maxTeamSize || 4,
            rules: data.rules || '',
            judgingCriteria: data.judgingCriteria || ''
          });
        } else {
          setError('Failed to fetch hackathon details.');
        }
      } catch (err) {
        setError('Error connecting to server.');
      } finally {
        setFetching(false);
      }
    };
    
    fetchHackathon();
  }, [id]);

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
      const response = await fetch(`http://localhost:5000/api/hackathons/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Hackathon updated successfully!');
        setTimeout(() => navigate('/organizer-dashboard'), 2000);
      } else {
        setError(data.message || 'Failed to update hackathon');
      }
    } catch (err) {
      setError('An error occurred while updating the hackathon.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="create-hackathon-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="create-hackathon-container">
      <div className="form-card glass">
        <h2 className="form-title">Edit <span className="text-gradient">Hackathon</span></h2>
        <p className="form-subtitle">Update the details of your hackathon below.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="hackathon-form">
          <div className="form-group">
            <label>Hackathon Title*</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description*</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Theme</label>
              <input type="text" name="theme" value={formData.theme} onChange={handleChange} />
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
              <input type="text" name="venue" value={formData.venue} onChange={handleChange} />
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
              <input type="text" name="prizePool" value={formData.prizePool} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Max Team Size</label>
              <input type="number" name="maxTeamSize" value={formData.maxTeamSize} onChange={handleChange} min="1" max="10" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Rules</label>
            <textarea name="rules" value={formData.rules} onChange={handleChange} rows="3"></textarea>
          </div>
          
          <div className="form-group">
            <label>Judging Criteria</label>
            <textarea name="judgingCriteria" value={formData.judgingCriteria} onChange={handleChange} rows="3"></textarea>
          </div>

          <div className="form-group">
            <label>Update Banner Image (Upload)</label>
            <p style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '-0.25rem', marginBottom: '0.5rem'}}>Leave blank to keep existing image</p>
            <input type="file" name="bannerImage" accept="image/*" onChange={handleFileChange} className="file-input" />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHackathon;
