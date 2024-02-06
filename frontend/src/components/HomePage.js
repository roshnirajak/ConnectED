import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlag } from '@fortawesome/free-solid-svg-icons'

const PageSize = 10; // Number of items to display per page

const HomePage = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://192.168.1.7:8000/get-question/?page=${currentPage}`);
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
        </div>

    );
};

export default HomePage;

