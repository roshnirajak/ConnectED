import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';


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

  const isFnameValid = formData.full_name.length >= 3;
  const isEmailValid = formData.email.length >= 5;
  const isCollegeValid = formData.college_name.length >= 3;
  const isPasswordValid = formData.password.length >= 8 && formData.password.length <= 79;
  const isFormValid = isFnameValid && isEmailValid && isCollegeValid && isPasswordValid;
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const csrfToken = Cookies.get('csrftoken')
    try {
      // Prepare the data to be sent
      const requestData = {
        ...formData,
        csrfmiddlewaretoken: csrfToken, // Include CSRF token in the request data
      };

      // Send a POST request to your Django server
      const response = await axios.post('http://169.254.37.113:8000/register/', requestData, {
        withCredentials: true, // Include credentials (cookies) in the request
        headers: {
          'Content-Type': 'application/json',  // Add any required headers here
          'X-CSRFToken': csrfToken
        },
      });

      if (response.status === 200) {
        // Registration successful
        console.log('Registration successful!');
        navigate('/login'); // Redirect to login page
      } else {
        console.error('Registration failed:', response.status);
        setErrorMessage('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage("Email Exists");
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
          <select
            name="community_id"
            value={formData.community_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a course</option>
            <option value="1">BCA</option>
            <option value="2">BCom</option>
            <option value="3">BCom Hons.</option>
            <option value="4">BBA</option>
          </select>
        </div>
      </label>
      <br />

      <label>
        Password:
        <input type="password" name="password" value={formData.password} minLength="8" onChange={handleChange} required />
      </label>

      <br />
      <input type="text" name="user_role" value={formData.user_role = '2'} onChange={handleChange} required hidden />
      {/* 0:!user_role 1:verifued_mentor 2:student */}

      <button type="submit" disabled={!isFormValid}>
        Register
      </button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </form>
  );
};

export default StudentRegistrationForm;
