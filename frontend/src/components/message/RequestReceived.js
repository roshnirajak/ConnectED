import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const RequestReceivedComponent = () => {
    const [conversations, setConversations] = useState([]);
    const [toUser, setToUser] = useState(null);
    const [reloadComponent, setReloadComponent] = useState(false);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('http://169.254.37.113:8000/message/get-request-received/', {
                withCredentials: true,
            });
            console.log(response.data)
            setConversations(response.data.conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            // Handle error if needed
        }
    };
    useEffect(() => {
        fetchConversations();
    }, []);

    const acceptMessageRequest = async (userId) => {
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
            fetchConversations()

        } catch (error) {
            console.error('Error sending message request:', error);
            // Handle error if needed
        }
    };
    const rejectMessageRequest = async (userId) => {
        try {
            const csrfToken = Cookies.get('csrftoken');
            await axios.post(`http://169.254.37.113:8000/message/reject-request/${userId}`, {
                to_user: toUser,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });
            console.log('Message request rejected successfully!');
            fetchConversations()

        } catch (error) {
            console.error('Error sending message request:', error);
            // Handle error if needed
        }
    };
    return (
        <div className="conversation-rec-container">
            <h2>Request Received</h2>
            <ul>
                {conversations.map((conversation, index) => (
                    <li key={index}>
                        <Link to={`/friend-profile/${conversation.user_id}`}>
                        <img
                            alt="profile"
                            style={{
                                border: `1px solid ${conversation.display_image === '1' ? 'blue' : '#ddd'}`,
                                borderRadius: '50%',
                                width: '25px',
                                height: '25px'
                            }}
                            src={`${conversation.display_image}&size=25`}
                        />
                        <span>{conversation.full_name}</span>
                        </Link>
                        <button className='accept' onClick={() => acceptMessageRequest(conversation.user_id)}>Accept</button>
                        <button className='reject' onClick={()=>{rejectMessageRequest(conversation.user_id)}}>Reject</button>
                    </li>
                ))}
                
            </ul>
        </div>
    );
};

export default RequestReceivedComponent;