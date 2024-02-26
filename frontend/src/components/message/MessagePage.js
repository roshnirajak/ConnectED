import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../Navbar';
import RequestReceivedComponent from './RequestReceived';
import RequestSentComponent from './RequestSent';
import InboxComponent from './Inbox';

const MessagePage = () => {
    const [activeComponent, setActiveComponent] = useState(null);
    const [activeButton, setActiveButton] = useState('Inbox');

    useEffect(() => {
        handleClick('Inbox');
    }, []);

    const handleClick = (componentName) => {
        setActiveComponent(componentName);
        setActiveButton(componentName);
    };

    const renderComponent = () => {
        switch (activeComponent) {
            case 'RequestReceived':
                return <RequestReceivedComponent />;
            case 'Inbox':
                return <InboxComponent />;
            case 'RequestSent':
                return <RequestSentComponent />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="msg-box-container">
                <h1>Message Box</h1>
                <div className="msg-button-container">
                    <button
                        className={activeButton === 'RequestReceived' ? 'active' : ''}
                        onClick={() => handleClick('RequestReceived')}
                    >
                        Request Received
                    </button>
                    <button
                        className={activeButton === 'Inbox' ? 'active' : ''}
                        onClick={() => handleClick('Inbox')}
                    >
                        Inbox
                    </button>
                    <button
                        className={activeButton === 'RequestSent' ? 'active' : ''}
                        onClick={() => handleClick('RequestSent')}
                    >
                        Request Sent
                    </button>
                </div>
                <div className="msg-component-container">
                    {renderComponent()}
                </div>
            </div>

            <Navbar />
        </>
    );
};


export default MessagePage;