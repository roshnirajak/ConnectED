import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AddAnswer = () => {
    const [csrfToken, setCsrfToken] = useState('');
    const [answerContent, setAnswerContent] = useState('');
    const { questionId } = useParams();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchCsrfCookie = async () => {
            try {
                const response = await axios.get('http://192.168.1.7:8000/csrf_cookie/', {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    const csrfCookie = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('csrftoken='))
                        .split('=')[1];

                    setCsrfToken(csrfCookie);
                    console.log('CSRF token:', csrfCookie);
                } else {
                    console.error('Failed to fetch CSRF cookie:', response.status);
                }
            } catch (error) {
                console.error('Error during CSRF cookie fetch:', error);
            }
        };

        fetchCsrfCookie();
    }, []);

    const handleAddAnswer = async () => {
        try {
            if (answerContent.length <= 20 || answerContent.length > 255) {
                setErrorMessage('Answer content must be between 20 and 255 characters.');
                return;
            }
            const response = await axios.post(
                `http://192.168.1.7:8000/add-answer/${questionId}`,
                {
                    answer_content: answerContent,
                    question_id: questionId,
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                }
            );

            console.log(response.data);
            setErrorMessage('');
            window.location.href=`/question-detail/${questionId}`
        } catch (error) {
            console.error('Error adding answer:', error);
            setErrorMessage('Your answer is quite offensive.');
        }
    };

    return (
        <div>
            {/* Add your input fields and form structure here */}
            <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Enter your answer"
            />
            <button onClick={handleAddAnswer}>Add Answer</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default AddAnswer;
