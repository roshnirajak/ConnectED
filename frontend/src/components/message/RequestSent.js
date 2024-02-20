import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const RequestSentComponent = () => {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get('http://169.254.37.113:8000/message/get-request-sent/', {
                    withCredentials: true,
                });
                console.log(response.data)
                setConversations(response.data.conversations);
            } catch (error) {
                console.error('Error fetching conversations:', error);
                // Handle error if needed
            }
        };

        fetchConversations();
    }, []);
    return (
        <div>
            <h2>Request Sent</h2>
            <ul>
                {conversations.map((conversation, index) => (
                    <li key={index}>
                        <img src={`${conversation.display_image}&size=50`} alt="Profile" style={{ width: '50px', height: '50px',border:'1px solid #000', borderRadius: '50%' }} />
                        <span>{conversation.full_name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RequestSentComponent;