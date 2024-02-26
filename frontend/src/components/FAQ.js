import React from 'react';
import Navbar from './Navbar';

const FAQ = () => {
  return (
    <>
    <div className='faq-component'>
      <h2>FAQ</h2>
      <div className="faq-item">
        <h3>How can I connect with other users in the Q&A forum and chat section?</h3>
        <p>Send a chat request from their profile; users can accept or reject.</p>
      </div>
      <div className="faq-item">
        <h3>Can I join multiple communities on the app?</h3>
        <p>No you can't join multiple communities .</p>
      </div>
      <div className="faq-item">
        <h3>What happens if my chat request is rejected?</h3>
        <p>You won't be able to send another request to that user.</p>
      </div>
      <div className="faq-item">
        <h3>What is the character limit for adding an answer?</h3>
        <p>The limit for adding an answer is 200 characters.</p>
      </div>
      <div className="faq-item">
        <h3>Are there separate sections for students and mentors?</h3>
        <p>Yes, the app has dedicated sections for both students and mentors.</p>
      </div>
    </div>
    <Navbar/>
    </>
  );
};

export default FAQ;
