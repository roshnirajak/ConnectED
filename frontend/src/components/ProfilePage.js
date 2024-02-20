import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import Navbar from './Navbar';

const ProfilePage = () => {
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

                if (data.user_role === '0') {
                    window.location.href = '/mentor-wait';
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
            <div className="user-profile-container">
                {userProfile ? (
                    <div>
                        <h2>My Profile</h2>
                        <p>
                            <img
                                alt="profile"
                                style={{
                                    border: `3px solid ${userProfile.profile.user_role === '1' ? '#91a2f6' : '#ddd'}`,
                                    borderRadius: '50%',
                                    width: '200px',
                                    height: '200px'
                                }}
                                src={`${userProfile.profile.display_image}&size=200`}
                            />
                        </p>
                        {/* <p>
                        <strong>Mentor Image:</strong>
                        <br />
                        <img src={`data:image/png;base64, ${userProfile.mentor_id_image_data}`} style={{ border: '1px solid #ddd', height: '250px' }} alt="Mentor ID" />
                    </p> */}
                        <h2>{userProfile.profile.full_name}</h2>
                        <p><strong>{userProfile.email}</strong></p>
                        {userProfile.profile.user_role === "1" ? (
                            <p><span>Designation:</span> {userProfile.profile.designation}</p>
                        ) : (
                            <p><span>College</span><br/><strong>{userProfile.profile.college_name}</strong></p>
                        )}
                        <p><strong>Community: </strong>
                            {userProfile.profile.community_id === 1 ? 'BCA' :
                                userProfile.profile.community_id === 2 ? 'BCom' :
                                    userProfile.profile.community_id === 3 ? 'BCom Hons' :
                                        userProfile.profile.community_id === 4 ? 'BBA' :
                                            'Unknown Course'}
                        </p>
                        {userProfile.profile.rank !== "" ? (
                            <p><span>Rank:</span> {userProfile.profile.rank}</p>
                        ) : (
                            <p><span>Rank</span><br/>None</p>
                        )}
                        <Link to="/my-questions"><button className='register-button'>My Questions</button></Link>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
                <br/>
                <br/>
                <br/>
            </div>
            <Navbar />
        </div>
    );
};

export default ProfilePage;
