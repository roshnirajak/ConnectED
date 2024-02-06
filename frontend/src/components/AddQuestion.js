import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AddQuestion = () => {
    const navigate = useNavigate();
    const [csrfToken, setCsrfToken] = useState('');
    const [questionContent, setQuestionContent] = useState('');
    const [subject, setSubject] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        const fetchCsrfCookie = async () => {
            try {
                // Fetch CSRF cookie from Django using Axios
                const response = await axios.get('http://192.168.1.7:8000/csrf_cookie/', {
                    withCredentials: true, // Include credentials (cookies) in the request
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    // Extract CSRF token from the cookie
                    const csrfCookie = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('csrftoken='))
                        .split('=')[1];

                    setCsrfToken(csrfCookie)
                    console.log('CSRF token:', csrfCookie);
                } else {
                    console.error('Failed to fetch CSRF cookie:', response.status);
                }
            } catch (error) {
                console.error('Error during CSRF cookie fetch:', error);
            }
        };

        // Call the function to fetch CSRF cookie 
        fetchCsrfCookie();

        const csrfCookie = Cookies.get('csrftoken');
        if(!csrfCookie){
            window.location.href='/login';
        }
    }, [navigate]);
    const handleAddQuestion = async () => {
        try {
            // Validate input lengths
            if (questionContent.length <= 20 || questionContent.length > 200) {
                setErrorMessage('Question content and subject must be less than 200 characters.');
                return;
            }
            else if (subject.length > 3 || subject.length < 20) {
                setErrorMessage('Subject must be between 3 and 20 characters.');
                return;
            }

            // Make API request using Axios
            const response = await axios.post(
                'http://192.168.1.7:8000/add-question/',
                {
                    question_content: questionContent,
                    subject: subject,
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                }
            );
            // Handle successful response
            console.log(response.data);
            setErrorMessage('');
            window.location.href='/homepage';
        } catch (error) {
            // Handle error
            console.error('Error adding question:', error);
            setErrorMessage('Your Question is quite offensive.');
        }
    };

    return (
        <div>
            <h2>Add Question</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <div>
                <label>Question Content:</label>
                <textarea
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                />
            </div>
            <div>
                <label>Subject:</label>
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject"
                />
            </div>
            <button onClick={handleAddQuestion}>Add Question</button>
        </div>
    );
};

export default AddQuestion;
