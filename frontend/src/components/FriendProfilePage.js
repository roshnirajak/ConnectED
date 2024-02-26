import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from './Navbar';

const FriendProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [requestStatus, setRequestStatus] = useState(null);
    const [acceptRequest, setAcceptRequest] = useState(null);
    const { userId } = useParams();
    const [toUser, setToUser] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const csrfToken = Cookies.get('csrftoken');
                const response = await axios.get(`http://169.254.37.113:8000/friend-profile/${userId}`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                });
                const data = response.data;
                console.log('User profile data:', data);

                if (data.message === "You cannot friend yourself") {
                    window.location.href = '/profile';
                } else {
                    setUserProfile(data);
                    getRequestStatus();
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                if (error.response && error.response.status === 401) {
                    window.location.href = '/homepage';
                } else {
                    window.location.href = '/homepage';
                }
            }
        };

        fetchUserProfile();
    }, [userId]);

    const getRequestStatus = async () => {
        try {
            const csrfToken = Cookies.get('csrftoken');
            const response = await axios.get(`http://169.254.37.113:8000/message/get-status/${userId}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });
            const data = response.data;
            // Set the request status
            if (data.message === "pending" || data.message === "rejected" || data.message === "accepted") {
                setRequestStatus(data.message);
            }
            else if (data.message === "Accept Request") {
                setAcceptRequest(data.message)
            }
        } catch (error) {
            console.error('Error getting message request status:', error);
            // Handle error if needed
        }
    };
    const sendMessageRequest = async () => {
        try {
            const csrfToken = Cookies.get('csrftoken');
            await axios.post(`http://169.254.37.113:8000/message/send-request/${userId}`, {
                to_user: toUser,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });
            console.log('Message request sent successfully!');
            // Assuming you want to fetch request status after sending the message request
            getRequestStatus();
        } catch (error) {
            console.error('Error sending message request:', error);
            // Handle error if needed
        }
    };
    const acceptMessageRequest = async () => {
        try {
            const csrfToken = Cookies.get('csrftoken');
            await axios.post(`http://169.254.37.113:8000/message/accept-request/${userId}`, {
                to_user: toUser,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });
            console.log('Message request accepted successfully!');
            // Assuming you want to fetch request status after sending the message request
            setAcceptRequest(null);
            getRequestStatus();
        } catch (error) {
            console.error('Error sending message request:', error);
            // Handle error if needed
        }
    };
    return (
        <div>
            {userProfile ? (
                <div className="user-profile-container">
                    <h2>User Profile Details</h2>
                    <p> <br />
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

                    {requestStatus && (requestStatus === "pending" || requestStatus === "rejected" || requestStatus === "accepted") && (
                        <p>Request Status: {requestStatus}</p>
                    )}
                    {acceptRequest && acceptRequest === "Accept Request" && (
                        <button onClick={acceptMessageRequest} className="register-button">Accept Request</button>
                    )}
                    {!requestStatus && !acceptRequest && (
                         <>
                         <p>(This is a one time function, to stop spams)</p>
                         <button onClick={sendMessageRequest} className="register-button">Send Message Request</button>
                     </>
                    )}
                </div>
            ) : (
                <p>Loading...</p>
            )}
            <Navbar />
        </div>
    );
};

export default FriendProfilePage;
