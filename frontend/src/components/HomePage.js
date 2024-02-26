import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from './Navbar';

const PageSize = 10; // Number of items to display per page

const HomePage = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [community, setCommunity] = useState('');
    const [hasNewNotification, setHasNewNotification] = useState(false);

    const fetchCommunity = async () => {
        const csrfToken = Cookies.get('csrftoken');
        try {
            const response = await axios.get('http://169.254.37.113:8000/get-community/', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                }
            });
            setCommunity(response.data.community);
            console.log("communit", community)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchData = async () => {
        const csrfToken = Cookies.get('csrftoken');
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

    useEffect(() => {
        fetchCommunity();
        fetchData();

        // Refresh data every 2 seconds
        const intervalId = setInterval(fetchData, 3000);

        // Cleanup function to clear interval when component unmounts
        return () => clearInterval(intervalId);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // fetchData(newPage);
    };

    return (
        <div>
            <div className="home-page-container">
                <h1>
                    {(() => {
                        switch (community) {
                            case 1:
                                return "BCA Community";
                            case 2:
                                return "BCom Community";
                            case 3:
                                return "BCom Hons Community";
                            case 4:
                                return "BBA Community";
                            default:
                                return " ";
                        }
                    })()}
                </h1>
                <div className='add-question-button'><Link to="/add-question">Add Question</Link></div><br />
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
                                            border: `5px solid ${item.user_role === "1" ? '#91a2f6' : '#ddd'}`,
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
                                        border: `5px solid ${item.user_role === "1" ? '#91a2f6' : '#ddd'}`,
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


                        

                        <Link to={`/question-detail/${item.question_id}`}>
                            <button className='num-of-answer'><b>{item.answer_count} Answer</b></button>
                        </Link>

                    </div>
                ))}
                <div className="pagination-container">
                    <span className="pagination-info">Page {currentPage} of {totalPages}</span> <br />
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button key={index} onClick={() => handlePageChange(index + 1)} className="pagination-button">
                            {index + 1}
                        </button>
                    ))}
                </div>

                <br />
                <br />
                <br />
            </div>
            <Navbar />
        </div>
    );
};

export default HomePage;
