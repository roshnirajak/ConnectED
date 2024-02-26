import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from './Navbar';

const Settings = () => {
  const csrfToken = Cookies.get('csrftoken');

  const handleLogout = async () => {
    try {
      const response = await axios.post(`http://169.254.37.113:8000/logout/`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });
      if(response.data){
        
        document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        window.location.href = '/';
        console.log(response.data)
      }
      
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  const handleDelete = async () => {
    try {
      const response = await axios.post('http://169.254.37.113:8000/delete/',{}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });
      if(response.data){
        
        document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        window.location.href = '/';
        console.log(response.data)
      }
      
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  return (
    <div>
    <div className="settings-container">
      <h1>Settings</h1>
      <div className="settings-option">
        <Link to="/profile">
        <label>
          <h3>My Profile</h3>
          Check Details of your profile
        </label>
        </Link>
        <hr />
      </div>
      <div className="settings-option">
      <Link to="/faq">
        <label>
          <h3>FAQ</h3>
          Get Insights to your doubts about our app
        </label>
        </Link>
        <hr />
      </div>
      <div className="settings-option">
        <label onClick={handleLogout}>
          <h3>Logout</h3>
          Logout from your account with ease login again!
          See you soon
        </label>
        <hr />
      </div>
      <div className="settings-option">
        <label onClick={handleDelete} className='delete'>
          <h3>Delete Your Account</h3>
          This option will permanently delete your account from our database
        </label>
        <hr />
      </div>
    </div>
    <br/>
    <br/>
    <br/>
    <Navbar/>
    </div>
  );
}


export default Settings;
