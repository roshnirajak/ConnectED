import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState([]);
  const csrfToken = Cookies.get('csrftoken')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    college_name: '0',
    community_id: '',
    designation: '',
    mentor_id_card: null,
    user_role: '',
    password: '',
    previewImage: null,  //image preview
  });

  useEffect(() => {
    fetchCommunities()
  }, [])


  // Check Valid Form``
  const isFnameValid = formData.full_name.length >= 3;
  const isEmailValid = formData.email.length >= 5;
  const isDesignationValid = formData.designation.length >= 3;
  const isPasswordValid = formData.password.length >= 8 && formData.password.length <= 14;
  const isImageValid =
    formData.mentor_id_card &&
    formData.mentor_id_card.size <= 1024 * 1024 && // 1MB
    ['image/jpeg', 'image/png'].includes(formData.mentor_id_card.type);

  const isFormValid = isFnameValid && isEmailValid && isDesignationValid && isPasswordValid && isImageValid;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]

    // Check if a file was selected
    if (!file) {
      return;
    }

    // Check file size
    if (file.size > 1024 * 1024) {
      setErrorMessage('Image size should be less than 1MB');
      return;
    }

    // Check file format
    const allowedFormats = ['image/jpeg', 'image/png'];
    if (!allowedFormats.includes(file.type)) {
      setErrorMessage('Only JPG or PNG images are allowed');
      return;
    }

    // Set the file and preview
    setFormData({ ...formData, mentor_id_card: file, previewImage: URL.createObjectURL(file) });
    setErrorMessage(''); // Clear any previous error messages
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const csrfToken = Cookies.get('csrftoken')

    const formDataToSend = new FormData();
    formDataToSend.append('full_name', formData.full_name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('college_name', formData.college_name);
    formDataToSend.append('designation', formData.designation);
    formDataToSend.append('mentor_id_card', formData.mentor_id_card);
    formDataToSend.append('community_id', formData.community_id); // Include community_id
    formDataToSend.append('user_role', formData.user_role);
    formDataToSend.append('password', formData.password);

    try {
      const response = await axios.post('http://169.254.37.113:8000/register/', formDataToSend, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',  // Use multipart/form-data for file uploads
          'X-CSRFToken': csrfToken,
        },
      });

      if (response.status === 200) {
        // Mentor registration successful
        console.log('Mentor registration successful!');
        navigate('/verify-account'); // Redirect to login page
      } else {
        console.error('Mentor registration failed:', response.status);
        setErrorMessage('Mentor registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during mentor registration:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Email Exists');
      }
    }
    finally{
      setLoading(false);
    }
  }
  const fetchCommunities = async () => {
    try {
      const response = await axios.get('http://169.254.37.113:8000/api/get_all_community/', {
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
      <h1>Mentor Registration </h1>
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
        Designation:
        <input type="text" name="designation" value={formData.designation} onChange={handleChange} required />
      </label>

      <br />
      <label>
        Identity Card Image:
      </label>
      <label className="file-input-label">

        <input type="file" name="mentor_id_card" accept="image/*" onChange={handleFileChange} required />

        {formData.previewImage && <div className="file-preview"><img src={formData.previewImage} alt="Preview" /></div>}
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
              <option key={community.community_id} value={community.community_id}>
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
      <input type="text" name="user_role" value={formData.user_role = '0'} onChange={handleChange} required hidden />
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
