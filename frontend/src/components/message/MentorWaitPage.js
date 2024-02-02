// HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const MentorWaitPage = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        // Check if the user is authenticated by checking the session
        const userEmail = Cookies.get('email');
        if (!userEmail) {
            // Redirect to login page if the user is not authenticated
            navigate('/login');
        } else {
            // Access the user's email from the cookie
            fetch(`http://localhost:8000/api/get_user_profile/?email=${encodeURIComponent(userEmail)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch user profile');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('User profile data:', data);
                    setUserProfile(data);
                    if(data.user_role==='1'){
                        window.location.href = '/profile';
                    }
                })
                .catch(error => {
                    console.error('Error fetching user profile:', error);
                    setErrorMessage('Failed to fetch user profile');
                });
        }
    }, [navigate]);
    return (
        <div>
            {userProfile ? (
                <div>
                    <h2>Hello User</h2>
                    <p>We are currently verifying your details along with the document you provided</p>
                    <p>Kindly wait for 24hrs</p>
                    
                </div>
            ) : errorMessage ? (
                <p style={{ color: 'red' }}>{errorMessage}</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default MentorWaitPage;
