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

    useEffect(() => {
        handleClick('Inbox');
    }, []);

    const handleClick = (componentName) => {
        setActiveComponent(componentName);
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
        <div>
        <h1>Message Box</h1>
            <button onClick={() => handleClick('RequestReceived')}>Request Received</button>
            <button onClick={() => handleClick('Inbox')}>Inbox</button>
            <button onClick={() => handleClick('RequestSent')}>Request Sent</button>
            <div>
                {renderComponent()}
            </div>
        </div>
        <Navbar/>
        </>
    );
};


export default MessagePage;