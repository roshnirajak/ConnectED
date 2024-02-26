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
        <div className="conversation-sent-container">
            <h2>Request Sent</h2>
            <ul>
                {conversations.map((conversation, index) => (
                    <li key={index}>
                        <img src={`${conversation.display_image}&size=25`} alt="Profile" />
                        <span>{conversation.full_name}</span>
                    </li>
                ))}
            </ul>
        </div>

    );
};

export default RequestSentComponent;