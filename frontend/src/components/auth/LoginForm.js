import React, { useState } from 'react';
import Cookies from 'js-cookie';

const LoginForm = () => {
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
  
    try {
      const response = await fetch('http://192.168.1.7:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.message);
      } 
      else {
        Cookies.set('email', formData.email, { expires: 14 }); //expiration day after 14 days
        console.log(Cookies.get('email')); 
        // Redirecting to profile page
        window.location.href = '/profile';
      }
    } catch (error) {
      console.error('Error during login:', error);
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
