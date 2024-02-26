// HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const MentorWaitPage = () => {
    const [userProfile, setUserProfile] = useState(null);
    useEffect(() => {
        const sessionId = Cookies.get('sessionid');
        const csrfToken = Cookies.get('csrftoken');
        console.log(csrfToken);
        console.log(sessionId);
        axios.get('http://169.254.37.113:8000/user-profile/', {
            withCredentials: true,
            // headers: {
            //     'Content-Type': 'application/json',
            //     'sessionid': sessionId,
            //     'X-CSRFToken': csrfToken,
            // },
        })
            .then(response => {
                const data = response.data;
                console.log('User profile data:', data);
                setUserProfile(data);

                if (response.data.profile.user_role === "1") {
                    window.location.href = '/homepage';
                }
                if (response.data.profile.user_role === "3") {
                    window.location.href = '/remove-mentor';
                }
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);

                if (error.response && error.response.status === 401) {
                    window.location.href = '/login';
                } else {
                    window.location.href = '/login';
                }
            });
    }, []);
    return (
        <div>
           
                <div>
                    <h2>Hello User</h2>
                    <p>We are currently verifying your details along with the document you provided</p>
                    <p>Kindly wait for 24hrs</p>
                    
                </div>
           
        </div>
    );
};

export default MentorWaitPage;
