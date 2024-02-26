import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import MentorTable from './MentorTablePage';
import AddCommunity from './AddComminity';
import ReportedQuestion from './ReportedQuestion';
import ReportedAnswer from './ReportedAnswer';
import Navbar from '../Navbar';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeComponent, setActiveComponent] = useState('mentor');

    useEffect(() => {
        const email = Cookies.get('email');
        if (email !== "xyz@mail.com") {
            navigate('/homepage')
        }
    }, [])
    return (
        <>
            <div className='admin-panel'>
                <div className='admin-header'>
                    <h1>Admin Panel</h1>
                    <div>
                        <button onClick={() => setActiveComponent('community')}>Add Community</button>
                        <button onClick={() => setActiveComponent('mentor')}>Verify Mentor</button>
                        <button onClick={() => setActiveComponent('reported-question')}>Reported Question</button>
                        <button onClick={() => setActiveComponent('reported-answer')}>Reported Answer</button>
                        {/* <hr /> */}
                    </div>
                </div>

                <div>
                    {activeComponent === 'community' && <AddCommunity />}
                    {activeComponent === 'mentor' && <MentorTable />}
                    {activeComponent === 'reported-question' && <ReportedQuestion />}
                    {activeComponent === 'reported-answer' && <ReportedAnswer />}
                </div>
            </div>
        </>
    );
};

export default AdminPanel;
