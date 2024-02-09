import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
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



  // Check Valid Form``
  const isFnameValid = formData.full_name.length >= 3;
  const isEmailValid = formData.email.length >= 5;
  const isDesignationValid = formData.designation.length >= 3;
  const isPasswordValid = formData.password.length >= 8 && formData.password.length <= 79;
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
      // Optionally, you can set the error message or take other actions
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
      // Send a POST request to your Django server
      const response = await axios.post('http://169.254.37.113:8000/register/', formDataToSend, {
        withCredentials: true, // Include credentials (cookies) in the request
        headers: {
          'Content-Type': 'multipart/form-data',  // Use multipart/form-data for file uploads
          'X-CSRFToken': csrfToken,
        },
      });

      if (response.status === 200) {
        // Mentor registration successful
        console.log('Mentor registration successful!');
        navigate('/login'); // Redirect to login page
      } else {
        setErrorMessage('Mentor registration failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Email Exists');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Mentor register </h1>
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
        <input type="file" name="mentor_id_card" accept="image/*" onChange={handleFileChange} required />
        {formData.previewImage && <img src={formData.previewImage} alt="Preview" style={{ height: '200px' }} />}
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
      <input type="text" name="user_role" value={formData.user_role = '0'} onChange={handleChange} required hidden />

      <button type="submit" disabled={!isFormValid}>
        Register
      </button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </form>
  );
};

export default StudentRegistrationForm;
