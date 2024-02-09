import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlag } from '@fortawesome/free-solid-svg-icons'

const PageSize = 10; // Number of items to display per page

const HomePage = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNewNotification, setHasNewNotification] = useState(false);

    useEffect(() => {

        const fetchNotifications = async () => {
            try {
              const response = await axios.get('http://169.254.37.113:8000/user-notifications/', {
                withCredentials: true
              });
              const notifications = response.data.notifications;
              setHasNewNotification(notifications.length > 0);
            } catch (error) {
              console.error('Error fetching notifications:', error);
            }
          };
      
          fetchNotifications();


        const fetchData = async () => {
            
        const csrfToken = Cookies.get('csrftoken')
            try {
                const response = await axios.get(`http://169.254.37.113:8000/question/get-question/?page=${currentPage}`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    }
                });
                setData(response.data.questions);
                setTotalPages(response.data.total_pages);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="home-page-container">
            <h2>Home Page</h2>
            {data.map((item) => (
                <div key={item.question_id} className="question-container">
                    <span className="question-content">{item.question_content}</span><br />
                    <span className="question-user">{item.user_full_name}</span>
                    <br />
                    <FontAwesomeIcon icon={faFlag} className="flag-icon" />
                    <Link to={`/question-detail/${item.question_id}`}>
                        <button>{item.answer_count} Answer</button>
                    </Link>
                </div>
            ))}
            <div className="pagination-container">
                <span className="pagination-info">Page {currentPage} of {totalPages}</span> <br />
                {Array.from({ length: totalPages }, (_, index) => (
                    <button key={index + 1} onClick={() => handlePageChange(index + 1)} className="pagination-button">
                        {index + 1}
                    </button>
                ))}
            </div>
            <Link to="/profile">
                <button className="profile-button">Profile</button>
            </Link>
            <Link to="/add-question">
                <button className="add-question-button">Add Question</button>
            </Link>
            <Link to="/notifications">
                
                <button className="add-question-button">
                    Notifications
                    {hasNewNotification && <span className="notification-badge"></span>}
                </button>
            </Link>
        </div>

    );
};

export default HomePage;

