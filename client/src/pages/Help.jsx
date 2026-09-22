import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  const faqs = [
    {
      question: 'How do I submit mess feedback?',
      answer: 'To submit feedback, go to the Mess Feedback tab and click on "Submit Feedback". Select the meal type, rate the food quality, add any comments, and click submit.'
    },
    {
      question: 'How do I apply for leave?',
      answer: 'Go to the Leave Application tab, click on "Apply for Leave", fill in the required details including leave type, dates, and reason, then submit your application.'
    },
    {
      question: 'How can I report a hostel issue?',
      answer: 'Navigate to the Hostel Reports tab, click on "Report Issue", select the appropriate category, provide location and description, set urgency level, and submit your report.'
    },
    {
      question: 'How do I mark my attendance?',
      answer: 'Navigate to the Attendance tab, select the date and attendance type, then click Save Attendance.'
    },
    {
      question: 'How do I register a visitor?',
      answer: 'Go to the Visitors tab, fill in the visitor details including name, phone number, purpose, and expected duration, then submit the registration form.'
    },
    {
      question: 'How can I pay my hostel fee?',
      answer: 'Go to the Payments tab, enter the amount, select payment type and method, and click Record Payment.'
    }
  ];

  return (
    <div className="tab-content active">
      <div className="section-title">
        <h2>Help & Support</h2>
        <span>Find answers to common questions</span>
      </div>
      
      <div className="help-section">
        <h3>Frequently Asked Questions</h3>
        
        {faqs.map((faq, index) => (
          <div className="faq-item" key={index} style={{ marginBottom: '10px' }}>
            <div 
              className="faq-question" 
              onClick={() => toggleFaq(index)}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer' }}
            >
              <span>{faq.question}</span>
              {openFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openFaq === index && (
              <div className="faq-answer" style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Help;