import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';


const Chatbox = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const { userId } = useParams();
    const chatboxRef = useRef(null);

    useEffect(() => {
        fetchUserProfile();
        fetchMessages();
        scrollToBottom();
        const intervalId = setInterval(fetchMessages, 3000); // Fetch messages every 2 seconds
        return () => clearInterval(intervalId);
    }, [messages]);

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
            setUserProfile(data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchMessages = async () => {
        const csrfToken = Cookies.get('csrftoken');
        try {
            const response = await axios.get(`http://169.254.37.113:8000/message/fetch-messages/${userId}/`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async () => {
        try {
            const csrfToken = Cookies.get('csrftoken');
            const response = await axios.post(`http://169.254.37.113:8000/message/send-message/${userId}/`, {
                content: content,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });

            if (response.status === 201) {
                console.log('Message sent successfully:', response.data);
                setContent('');
                // If you want to update messages immediately after sending, you can fetch them again
                fetchMessages();
            } else {
                console.error('Failed to send message:', response.data);
                // Handle failure
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Handle error
        }
    };
    const scrollToBottom = () => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    };
    return (
        <div className="chat-container"> {userProfile ? (
            <div><h2>
                <img
                    alt="profile"
                    style={{
                        border: `1px solid ${userProfile.profile.user_role === '1' ? 'blue' : '#ddd'}`,
                        borderRadius: '50%',
                        width: '25px',
                        height: '25px'
                    }}
                    src={`${userProfile.profile.display_image}&size=25`}
                />
                {userProfile.profile.full_name}
            </h2>



                <div ref={chatboxRef} style={{ height: '450px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
                    {messages.map((message, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: message.sender === 'current_user' ? 'flex-end' : 'flex-start' }}>
                            <p style={{
                                margin: '4px',
                                backgroundColor: message.sender === 'current_user' ? '#7787d7' : '#ddd', color: message.sender === 'current_user' ? '#fff' : '#111',
                                // border: message.sender === 'current_user' ? '0.5px solid green' : '0.5px solid blue',
                                padding: '8px 12px',
                                maxWidth: '50%',
                                marginTop: '5px',
                                marginBottom: '0px',
                                borderRadius: message.sender === 'current_user' ? '10px 10px 0 10px' : '10px 10px 10px 0',
                            }}>{message.content}</p>
                            <small style={{ margin: '0 4px', color: '#888' }}>
                                {new Date(message.timestamp).toLocaleDateString('en-GB')}
                            </small>
                        </div>
                    ))}
                </div>
                <div className='typing-area'>
                    <input
                        type='text'
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type your message..."
                        rows={4}
                    />
                    <button type="submit" onClick={() => sendMessage(content)}>Send</button>
                </div>
            </div>
        ) : (
            <p>Loading...</p>
        )}

        </div>
    );
};

export default Chatbox;
