import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [csrfCookie, setCsrfCookie] = useState('');
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
      const response = await axios.post('http://192.168.1.7:8000/register/', formDataToSend, {
        withCredentials: true, // Include credentials (cookies) in the request
        headers: {
          'Content-Type': 'multipart/form-data',  // Use multipart/form-data for file uploads
          'X-CSRFToken': csrfCookie,
        },
      });
  
      if (response.status === 200) {
        // Mentor registration successful
        console.log('Mentor registration successful!');
        navigate('/login'); // Redirect to login page
      } else {
        console.error('Mentor registration failed:', response.status);
        setErrorMessage('Mentor registration failed. Please try again.'); // Set an error message for the user
      }
    } catch (error) {
      console.error('Error during mentor registration:', error);
      setErrorMessage('Mentor registration failed. Please try again.'); // Set an error message for the user
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
        <input type="text" name="designation" value={formData.designation} onChange={handleChange} required/>
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
          <label>
            <input
              type="radio"
              name="community_id"
              value="1"
              checked={formData.community_id === '1'}
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
              checked={formData.community_id === '2'}
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
              checked={formData.community_id === '3'}
              onChange={handleChange}
            />
            BCom hons
          </label>
        </div>

        <div>
          <label>
            <input
              type="radio"
              name="community_id"
              value="4"
              checked={formData.community_id === '4'}
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
      <input type="text" name="user_role" value={formData.user_role='0'} onChange={handleChange} required hidden/>

      <button type="submit" disabled={!isFormValid}>
        Register
      </button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </form>
  );
};

export default StudentRegistrationForm;
