import React, { useState, useEffect } from 'react';

const StudentRegistrationForm = () => {
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

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('q') === 'emailexists') {
      setErrorMessage('Email already exists');
    }
  }, []);

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
    const file = e.target.files[0];
  
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

    const formDataToSend = new FormData();
    formDataToSend.append('full_name', formData.full_name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('college_name', formData.college_name);
    formDataToSend.append('designation', formData.designation);
    formDataToSend.append('mentor_id_card', formData.mentor_id_card);
    formDataToSend.append('community_id', formData.community_id);
    formDataToSend.append('user_role', formData.user_role);
    formDataToSend.append('password', formData.password);

    try {
      const response = await fetch('http://localhost:8000/register/', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      console.log(data);  // Handle the response as needed, maybe redirect to the login page
      window.location.href = '/login';
    } catch (error) {
      setErrorMessage('Email Exists');
      console.error('Error during registration:', error);
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
