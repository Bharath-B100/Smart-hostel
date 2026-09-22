import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { feedbackAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MessFeedback = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(currentUser?.isAdmin ? 'recent' : 'feedback');
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    mealType: '',
    rating: '',
    comments: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'recent') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbackAPI.getRecent();
      if (response.success) {
        setFeedbacks(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rating) {
      window.showNotification('Please provide a rating');
      return;
    }
    
    setLoading(true);
    try {
      const response = await feedbackAPI.submit({
        mealType: formData.mealType,
        foodRating: Number(formData.rating),
        comments: formData.comments,
        date: new Date().toISOString()
      });
      
      if (response.success) {
        window.showNotification('Feedback submitted successfully!');
        setFormData({ mealType: '', rating: '', comments: '' });
        setActiveTab('recent');
      }
    } catch (error) {
      window.showNotification('Failed to submit feedback');
    }
    setLoading(false);
  };

  return (
    <div className="tab-content active">
      <div className="section-title">
        <h2>Mess Feedback System</h2>
        <span>Share your feedback about hostel mess</span>
      </div>
      
      <div className="tabs">
        {!currentUser?.isAdmin && (
          <div className={`tab ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>Submit Feedback</div>
        )}
        <div className={`tab ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>Recent Feedback</div>
      </div>
      
      {!currentUser?.isAdmin && activeTab === 'feedback' && (
        <div className="tab-content active">
          <div className="feedback-form">
            <h3>Share Your Feedback</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="mealType">Meal Type</label>
                <select 
                  className="form-control" 
                  id="mealType" 
                  value={formData.mealType}
                  onChange={e => setFormData({...formData, mealType: e.target.value})}
                  required
                >
                  <option value="">Select Meal Type</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Food Quality Rating</label>
                <div className="rating">
                  {[5, 4, 3, 2, 1].map(num => (
                    <React.Fragment key={num}>
                      <input 
                        type="radio" 
                        id={`star${num}`} 
                        name="foodRating" 
                        value={num} 
                        checked={formData.rating === String(num)}
                        onChange={e => setFormData({...formData, rating: e.target.value})}
                      />
                      <label htmlFor={`star${num}`}>★</label>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="comments">Comments/Suggestions</label>
                <textarea 
                  className="form-control" 
                  id="comments" 
                  placeholder="Share your thoughts about the food, service, or suggestions for improvement..."
                  value={formData.comments}
                  onChange={e => setFormData({...formData, comments: e.target.value})}
                ></textarea>
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Send size={16} style={{ marginRight: '8px' }} /> {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {activeTab === 'recent' && (
        <div className="tab-content active">
          <h3>Recent Feedback from Students</h3>
          <div className="feedback-list">
            {feedbacks.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No recent feedback</p>
            ) : (
              feedbacks.map((fb, i) => (
                <div className="feedback-item" key={fb._id || i} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>{fb.user?.name || fb.userName || 'Anonymous'}</strong>
                    <span style={{ color: 'var(--warning)' }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    <span style={{ textTransform: 'capitalize' }}>{fb.mealType}</span> • {new Date(fb.createdAt || fb.date).toLocaleDateString()}
                  </div>
                  <p>{fb.comments}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessFeedback;