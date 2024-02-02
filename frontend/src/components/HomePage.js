// HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        // Check if the user is authenticated by checking the session
        const userEmail = Cookies.get('email');

        // Access the user's email from the cookie
        fetch(`http://192.168.1.7:8000/api/get_user_profile/?email=${encodeURIComponent(userEmail)}`)
            .then(response => {
                if (!response.ok) {
                    window.location.href = '/login';
                    throw new Error('Failed to fetch HomePage');
                }
                return response.json();
            })
            .then(data => {
                console.log('User profile data:', data);
                setUserProfile(data);
            })
            .catch(error => {
                console.error('Error fetching Homepage:', error);
            });

    }, [navigate]);
    return (
        <div>

            {userProfile ? (
                <div>
                    <h2>This is HomePage: {userProfile.full_name}</h2>
                    <Link to={'/profile/'}>Profile</Link><br />
                    <Link to={'/add-question/'}>Add Question</Link>
                </div>
            ) : errorMessage ? (
                <p style={{ color: 'red' }}>{errorMessage}</p>
            ) : (
                <div className="loading-spinner">Loading...</div>
            )}


        </div>
    );
};

export default HomePage;
