import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const FriendProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const { userId } = useParams();
    useEffect(() => {
        const sessionId = Cookies.get('sessionid');
        const csrfToken = Cookies.get('csrftoken');
        console.log(csrfToken);
        console.log(sessionId);
        axios.get(`http://169.254.37.113:8000/friend-profile/${userId}`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        })
            .then(response => {
                const data = response.data;
                console.log('User profile data:', data);

                if (data.message === "You cannot friend yourself") {
                    window.location.href = '/profile';
                } else {
                    setUserProfile(data);
                }

            })
            .catch(error => {
                console.error('Error fetching user profile:', error);

                if (error.response && error.response.status === 401) {
                    window.location.href = '/homepage';
                } else {
                    window.location.href = '/homepage';
                }
            });

    }, [userId]);
    return (
        <div>
            {userProfile ? (
                <div>
                    <h2>User Profile Details</h2>
                    <p><strong>Profile Image:</strong> <br />
                        <img
                            alt="profile"
                            style={{
                                border: `1px solid ${userProfile.profile.user_role === '1' ? 'blue' : '#ddd'}`,
                                borderRadius: '50%',
                                width: '250px',
                                height: '250px'
                            }}
                            src={`${userProfile.profile.display_image}`}
                        />
                    </p>
                    {/* <p>
                        <strong>Mentor Image:</strong>
                        <br />
                        <img src={`data:image/png;base64, ${userProfile.mentor_id_image_data}`} style={{ border: '1px solid #ddd', height: '250px' }} alt="Mentor ID" />
                    </p> */}
                    <p><strong>Name:</strong> {userProfile.profile.full_name}</p>
                    <p><strong>Email:</strong> {userProfile.email}</p>
                    <p><strong>College:</strong> {userProfile.profile.college_name}</p>
                    <p><strong>Course:</strong>
                        {userProfile.profile.community_id === 1 ? 'BCA' :
                            userProfile.profile.community_id === 2 ? 'BCom' :
                                userProfile.profile.community_id === 3 ? 'BCom Hons' :
                                    userProfile.profile.community_id === 4 ? 'BBA' :
                                        'Unknown Course'}
                    </p>

                </div>
            ) : (
                <p>Loading...</p>
            )}
            <Link to="/homepage">
                <button className="register-button">Homepage</button>
            </Link>
            <Link to="/homepage">
                <button className="register-button">Send Message Request</button>
            </Link>
            <Link to="/homepage">
                <button className="register-button">Homepage</button>
            </Link>
        </div>
    );
};

export default FriendProfilePage;
