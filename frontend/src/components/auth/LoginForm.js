import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(formData);
    const csrfToken= Cookies.get('csrftoken')
    try {
      const response = await axios.post(
        'http://169.254.37.113:8000/login/',
        JSON.stringify(formData), // Move the data object here
        {
          withCredentials:true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
        }
      );
  
      if (response.status === 200) {
        // Login successful
        Cookies.set('email', formData.email, { expires: 14 });
        console.log('Login successful!');
        window.location.href='/homepage';
      } else {
        console.error('Login failed:', response.status);
        setErrorMessage('Login failed. Please try again.'); // Set an error message for the user
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Login failed. Please try again.');
    }
  };
  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>Email:</label>
        <input type="email" name="email" onChange={handleChange} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" onChange={handleChange} />
      </div>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {/* <button type="submit">Login</button> */}
      <button type="submit" >Login
      </button>
    </form>
  );
};

export default LoginForm;
