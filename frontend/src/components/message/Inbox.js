import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const InboxComponent = () => {
    const [userProfiles, setUserProfiles] = useState([]);
    const [error, setError] = useState(null);

    const csrfToken = Cookies.get('csrftoken');

    useEffect(() => {
        const csrfToken = Cookies.get('csrftoken');
        const fetchData = async () => {
            try {
                const response = await axios.get('http://169.254.37.113:8000/message/get-inbox/', {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                });
                setUserProfiles(response.data.user_profiles);
            } catch (error) {
                setError('No Users to show');
            }
        };

        fetchData();
    }, []);

    return (
        <div className="inbox-container">
            <h2>Inbox</h2>
            {error && <p>{error}</p>}
            <ul>
                {userProfiles.map((profile) => (
                    <li key={profile.sender_user_id}>
                        <Link to={`/chat/${profile.sender_user_id}`}>
                            <img alt="profile" style={{
                                height: '25px',
                                width: '25px',
                                border: `5px solid ${profile.sender_user_role === "1" ? '#91a2f6' : '#ddd'}`,
                                borderRadius: '50%',
                                marginRight: '5px',
                            }} src={`${profile.sender_display_image}&size=25`} />
                            <span>{profile.sender_full_name}</span>
                            {/* <span>{profile.sender_email}</span> */}
                            {/* Add more fields as needed */}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InboxComponent;