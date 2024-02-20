// HomePage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../App.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
    const navigate = useNavigate();
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        if (Cookies.get('email')) {
            navigate('/homepage');
        }
    }, []);  

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

    // Call the function to fetch CSRF cookie when the component mounts



    const handleRedirectLogin = () => {
        fetchCsrfCookie();
        navigate('/login');
    };
    const handleRedirectStudentReg = () => {
        fetchCsrfCookie();
        navigate('/student-registration');
    }; const handleRedirectMentorReg = () => {
        fetchCsrfCookie();
        navigate('/mentor-registration');
    };
    return (
        <div className="welcome-container">
            <div className="logo-container">
                <img src="connectedlogo.png" alt="Connected Logo" />
            </div>
            <h1 className="welcome-heading">Welcome to the Connect<span>ED</span>!</h1>
            <div className="reg-button-container">

                <button onClick={handleRedirectStudentReg} className="register-button">Register as Student</button>


                <button onClick={handleRedirectMentorReg} className="register-button">Register as Mentor</button>

            </div>
            <button onClick={handleRedirectLogin} className="login-text-button">Already have an account <span>Login</span></button>
        </div>
    );
};

export default WelcomePage;
