// HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        const userEmail = Cookies.get('email');
        // Access the user's email from the cookie
        fetch(`http://192.168.1.7:8000/api/get_user_profile/?email=${encodeURIComponent(userEmail)}`)
            .then(response => {
                if (!response.ok) {
                    window.location.href = '/login';
                    throw new Error('Failed to fetch user profile');
                }
                return response.json();
            })
            .then(data => {
                console.log('User profile data:', data);
                setUserProfile(data);
                if (data.user_role === '0') {
                    window.location.href = '/mentor-wait';
                }
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
                setErrorMessage('Failed to fetch user profile');
                
            });

    }, [navigate]);
    return (
        <div>
            {userProfile ? (
                <div>
                    <h2>User Profile Details</h2>
                    <p><strong>Profile Image:</strong> <br /><img alt="profile" style={{ border: '1px solid #ddd', borderRadius: '50%', width: '250px', height: '250px' }} src={userProfile.display_image} /> </p>
                    {/* <p>
                        <strong>Mentor Image:</strong>
                        <br />
                        <img src={`data:image/png;base64, ${userProfile.mentor_id_image_data}`} style={{ border: '1px solid #ddd', height: '250px' }} alt="Mentor ID" />
                    </p> */}
                    <p><strong>Name:</strong> {userProfile.full_name}</p>
                    <p><strong>Email:</strong> {userProfile.email}</p>
                    <p><strong>College:</strong> {userProfile.college_name}</p>
                    <p><strong>Course:</strong> {userProfile.community_id}</p>
                </div>
            ) : errorMessage ? (
                <p style={{ color: 'red' }}>{errorMessage}</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default ProfilePage;
