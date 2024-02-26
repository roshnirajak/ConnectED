import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import Navbar from './Navbar';

const PageSize = 10; // Number of items to display per page

const MyQuestions = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [community, setCommunity] = useState('');
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const csrfToken = Cookies.get('csrftoken');

    const fetchData = async () => {

        try {
            const response = await axios.get('http://169.254.37.113:8000/question/my-questions-data/', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                }
            });
            setData(response.data.questions);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const handleDeleteQuestion = async (question_id) => {
        const csrfToken = Cookies.get('csrftoken');
        try {
            const response = await axios.post(
                `http://169.254.37.113:8000/question/my-questions-delete/${question_id}/`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                }
            );
            console.log(response.data);
        } catch (error) {
            console.error('Error deleting question:', error);
        }
        fetchData()
    };
    useEffect(() => {
        fetchData();

        // Refresh data every 2 seconds
        const intervalId = setInterval(fetchData, 100000);

        // Cleanup function to clear interval when component unmounts
        return () => clearInterval(intervalId);
    }, []);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div>
            <div className="home-page-container">

                <h1>My Questions</h1>
                {data.map((item) => (
                    <div key={item.question_id} className="question-container">
                        {item.self_user ? (
                            <React.Fragment>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img
                                        alt="profile"
                                        style={{
                                            height: '25px',
                                            width: '25px',
                                            border: `3px solid ${item.user_role === "1" ? '#91a2f6' : '#ddd'}`,
                                            borderRadius: '50%',
                                            marginRight: '5px',
                                        }}
                                        src={`${item.display_image}&size=25`}
                                    />
                                    <span className="question-user">{item.user_full_name}</span>
                                </div>
                            </React.Fragment>
                        ) : (

                            <Link to={`/friend-profile/${item.question_user}`}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img alt="profile" style={{
                                        height: '25px',
                                        width: '25px',
                                        border: `3px solid ${item.user_role === "1" ? '#91a2f6' : '#ddd'}`,
                                        borderRadius: '50%',
                                        marginRight: '5px',
                                    }} src={`${item.display_image}&size=25`} />
                                    <span className="question-user">{item.user_full_name}</span>
                                </div>
                            </Link>

                        )}
                        <br />

                        <span className="question-content">{item.question_content}</span>
                        <br />


                        <FontAwesomeIcon
                            icon={faTrash}
                            className="trash-icon"
                            onClick={() => handleDeleteQuestion(item.question_id)}
                        />

                        <Link to={`/question-detail/${item.question_id}`}>
                            <button className='num-of-answer'><b>{item.answer_count} Answer</b></button>
                        </Link>

                    </div>
                ))}
                

                <br />
                <br />
                <br />
            </div>
            <Navbar />
        </div>
    );
};

export default MyQuestions;
