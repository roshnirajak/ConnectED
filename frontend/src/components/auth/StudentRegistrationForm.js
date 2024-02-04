import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    college_name: '',
    community_id: '',
    user_role: '',
    password: ''
  });

  

  // const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [csrfCookie, setCsrfCookie] = useState('');

  const isFnameValid = formData.full_name.length >= 3;
  const isEmailValid = formData.email.length >= 5;
  const isCollegeValid = formData.college_name.length >= 3;
  const isPasswordValid = formData.password.length >= 8 && formData.password.length <= 79;
  const isFormValid = isFnameValid && isEmailValid && isCollegeValid && isPasswordValid;
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  useEffect(() => {
    const fetchCsrfCookie = async () => {
      try {
        // Fetch CSRF cookie from Django using Axios
        const response = await axios.get('http://192.168.1.7:8000/csrf_cookie/', {
          withCredentials: true, // Include credentials (cookies) in the request
          headers: {
            'Content-Type': 'application/json',  // Add any required headers here
          },
        });
  
        if (response.status === 200) {
          // Extract CSRF token from the cookie
          const csrfCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            .split('=')[1];
  
          // Use the csrfCookie value as needed
          setCsrfCookie(csrfCookie)
          console.log('CSRF token:', csrfCookie);
  
          // Once CSRF cookie is obtained, navigate to '/student-registration'
        } else {
          console.error('Failed to fetch CSRF cookie:', response.status);
        }
      } catch (error) {
        console.error('Error during CSRF cookie fetch:', error);
      }
    };
  
    // Call the function to fetch CSRF cookie when the component mounts
    fetchCsrfCookie();
  }, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Prepare the data to be sent
      const requestData = {
        ...formData,
        csrfmiddlewaretoken: csrfCookie, // Include CSRF token in the request data
      };
  
      // Send a POST request to your Django server
      const response = await axios.post('http://192.168.1.7:8000/register/', requestData, {
        withCredentials: true, // Include credentials (cookies) in the request
        headers: {
          'Content-Type': 'application/json',  // Add any required headers here
          'X-CSRFToken': csrfCookie
        },
      });
  
      if (response.status === 200) {
        // Registration successful
        console.log('Registration successful!');
        navigate('/login'); // Redirect to login page
      } else {
        console.error('Registration failed:', response.status);
        setErrorMessage('Registration failed. Please try again.'); // Set an error message for the user
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage('Registration failed. Please try again.'); // Set an error message for the user
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <h1>Student register </h1>
      <label>
        Name:
        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
      </label>
      <br />

      <label>
        Email:
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </label>
      <br />

      <label>
        College:
        <input type="text" name="college_name" value={formData.college_name} onChange={handleChange} required />
      </label>
      <br />

      <label>
        Course:
        <div>
          <label>
            <input
              type="radio"
              name="community_id"
              value="1"
              checked={formData.community_id === "1"}
              onChange={handleChange}
              required
            />
            BCA
          </label>
        </div>

        <div>
          <label>
            <input
              type="radio"
              name="community_id"
              value="2"
              checked={formData.community_id === "2"}
              onChange={handleChange}
            />
            BCom
          </label>
        </div>

        <div>
          <label>
            <input
              type="radio"
              name="community_id"
              value="3"
              checked={formData.community_id ==="3"}
              onChange={handleChange}
            />
            BCom Hons.
          </label>
        </div>

        <div>
          <label>
            <input
              type="radio"
              name="community_id"
              value="4"
              checked={formData.community_id === "4"}
              onChange={handleChange}
            />
            BBA
          </label>
        </div>
      </label>
      <br />

      <label>
        Password:
        <input type="password" name="password" value={formData.password} minLength="8" onChange={handleChange} required />
      </label>

      <br />
      <input type="text" name="user_role" value={formData.user_role = '2'} onChange={handleChange} required hidden/>
      {/* 0:!user_role 1:verifued_mentor 2:student */}

      <button type="submit" disabled={!isFormValid}>
        Register
      </button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </form>
  );
};

export default StudentRegistrationForm;
