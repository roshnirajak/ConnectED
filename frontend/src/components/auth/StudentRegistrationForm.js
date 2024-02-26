import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';


const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    college_name: '',
    community_id: '',
    user_role: '',
    password: ''
  });
  useEffect(()=>{
    fetchCommunities()
  },[])


  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const csrfToken = Cookies.get('csrftoken')
  const isFnameValid = formData.full_name.length >= 3;
  const isEmailValid = formData.email.length >= 5;
  const isCollegeValid = formData.college_name.length >= 3;
  const isPasswordValid = formData.password.length >= 8 && formData.password.length <= 14;
  const isFormValid = isFnameValid && isEmailValid && isCollegeValid && isPasswordValid;
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const csrfToken = Cookies.get('csrftoken')
    try {
      // Prepare the data to be sent
      setLoading(true);
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
        navigate('/verify-account'); // Redirect to login page
      } else {
        console.error('Registration failed:', response.status);
        setErrorMessage('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Email Exists');
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchCommunities = async () => {
    try {
      const response = await axios.get('http://169.254.37.113:8000/api/get_all_community/',{
        withCredentials: true, // Include credentials (cookies) in the request
        headers: {
          'Content-Type': 'application/json',  // Add any required headers here
          'X-CSRFToken': csrfToken
        },
      });
      setCommunities(response.data.communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };
  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>Student Registration </h1>
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
        College Name <span className='label-subhead'>(or University Name)</span>:
        <input type="text" name="college_name" value={formData.college_name} onChange={handleChange} required />
      </label>
      <br />

      <label>
        Select Community:
        <div>
          <select
            name="community_id"
            value={formData.community_id}
            onChange={handleChange}
            required
          >
            <option value="">Select your Course</option>
            {communities.map((community) => (
              <option key={community.community_id} value={`${community.community_id}`}>
                {community.community_name}
              </option>
            ))}
          </select>
        </div>
      </label>
      <br />

      <label>
        Password <span className='label-subhead'>(8 to 14 characters)</span>:
        <input type="password" name="password" value={formData.password} minLength="8" onChange={handleChange} required />
      </label>

      <br />
      <input type="text" name="user_role" value={formData.user_role = '2'} onChange={handleChange} required hidden />
      {/* 0:!user_role 1:verifued_mentor 2:student */}
      {loading ? (
        <p style={{ color: 'green' }}>Loading...</p>
      ) : (
        <>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </>
      )}
      <button type="submit" disabled={!isFormValid}>
        Register
      </button>

    </form>
  );
};

export default StudentRegistrationForm;
