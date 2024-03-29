import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const LoginForm = () => {
  const navigate = useNavigate();
  const [csrfToken, setCsrfToken] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCsrfCookie = async () => {
      try {
          // Fetch CSRF cookie from Django using Axios
          const response = await axios.get('http://169.254.37.113:8000/csrf_cookie/', {
              withCredentials: true, // Include credentials (cookies) in the request
              headers: {
                  'Content-Type': 'application/json',  // Add any required headers here
              },
          });

          if (response.status === 200) {
              // Extract CSRF token from the cookie
              const csrfToken = document.cookie
                  .split('; ')
                  .find(row => row.startsWith('csrftoken='))
                  .split('=')[1];

              // Use the csrfCookie value as needed
              setCsrfToken(csrfToken)
              console.log('CSRF token:', csrfToken);

              // Once CSRF cookie is obtained, navigate to '/student-registration'
          } else {
              console.error('Failed to fetch CSRF cookie:', response.status);
          }
      } catch (error) {
          console.error('Error during CSRF cookie fetch:', error);
      }
  };
  fetchCsrfCookie();

  }, [])

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
      const response = await axios.post(
        'http://169.254.37.113:8000/login/',
        JSON.stringify(formData), // Move the data object here
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
        }
      );

      if (response.status === 200) {
        // Login successful
        if (response.data.user_role === "0") {
          Cookies.set('email', formData.email, { expires: 14 });
          window.location.href = '/mentor-wait';
        }
        if (response.data.email === "xyz@mail.com") {
          Cookies.set('email', formData.email, { expires: 14 });
          window.location.href = '/admin';
        }
        else {
          Cookies.set('email', formData.email, { expires: 14 });
          console.log('Login successful!');
          window.location.href = '/homepage';
        }
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
    <form className="form-container login-page" onSubmit={handleLogin}>
      <div className="logo-container">
                <img src="connectedlogoblue.png" alt="Connected Logo" />
            </div>
      <h1>Login </h1>
      <label>Email:
        <input type="email" name="email" onChange={handleChange} />
      </label>

      <label>Password:
        <input type="password" name="password" onChange={handleChange} />
      </label>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {/* <button type="submit">Login</button> */}
      <button type="submit">Login </button>
    </form>
  );
};

export default LoginForm;
