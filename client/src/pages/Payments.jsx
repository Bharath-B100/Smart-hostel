import React, { useState, useEffect } from 'react';
import { IndianRupee } from 'lucide-react';
import { paymentsAPI, studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Payments = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(currentUser?.isAdmin ? 'fee-payment' : 'payment-records');
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paymentType: '',
    paymentMethod: '',
    paymentDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'fee-payment' && currentUser?.isAdmin) {
      fetchStudents();
    } else if (activeTab === 'payment-records') {
      fetchPayments();
    }
  }, [activeTab, currentUser]);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      if (response.success) setStudents(response.data || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getAll();
      if (response.success) setPayments(response.data || []);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await paymentsAPI.record({
        ...formData,
        amount: Number(formData.amount)
      });
      if (response.success) {
        window.showNotification('Payment recorded successfully!');
        setFormData({
          studentId: '',
          amount: '',
          paymentType: '',
          paymentMethod: '',
          paymentDate: ''
        });
        setActiveTab('payment-records');
      }
    } catch (error) {
      window.showNotification('Failed to record payment');
    }
    setLoading(false);
  };

  return (
    <div className="tab-content active">
      <div className="section-header">
        <h2>Payments Management</h2>
        <div className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="tabs">
        {currentUser?.isAdmin && (
          <div className={`tab ${activeTab === 'fee-payment' ? 'active' : ''}`} onClick={() => setActiveTab('fee-payment')}>Record Payment</div>
        )}
        <div className={`tab ${activeTab === 'payment-records' ? 'active' : ''}`} onClick={() => setActiveTab('payment-records')}>Payment Records</div>
      </div>
      
      {activeTab === 'fee-payment' && currentUser?.isAdmin && (
        <div className="tab-content active">
          <div className="student-form">
            <h3>Make Fee Payment</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="paymentStudent">Select Student</label>
                <select 
                  className="form-control" 
                  id="paymentStudent" 
                  required
                  value={formData.studentId}
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentAmount">Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="paymentAmount" 
                  placeholder="Enter amount" 
                  required 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentType">Payment Type</label>
                <select 
                  className="form-control" 
                  id="paymentType" 
                  required
                  value={formData.paymentType}
                  onChange={e => setFormData({...formData, paymentType: e.target.value})}
                >
                  <option value="">Select Type</option>
                  <option value="hostel_fee">Hostel Fee</option>
                  <option value="mess_fee">Mess Fee</option>
                  <option value="security_deposit">Security Deposit</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select 
                  className="form-control" 
                  id="paymentMethod" 
                  required
                  value={formData.paymentMethod}
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                >
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentDate">Payment Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="paymentDate" 
                  required 
                  value={formData.paymentDate}
                  onChange={e => setFormData({...formData, paymentDate: e.target.value})}
                />
              </div>
              
              <button type="submit" className="btn btn-success" disabled={loading}>
                <IndianRupee size={16} style={{ marginRight: '8px' }} /> {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'payment-records' && (
        <div className="tab-content active">
          <h3>Payment Records</h3>
          <div className="student-list">
            {payments.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No payment records found.</p>
            ) : (
              payments.map((payment, i) => (
                <div key={payment._id || i} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{payment.student?.name || 'Unknown Student'}</strong>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{payment.amount}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{(payment.paymentType || 'unknown').replace('_', ' ')}</strong> • {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Unknown Date'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Method:</strong> <span style={{ textTransform: 'capitalize' }}>{payment.paymentMethod}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;