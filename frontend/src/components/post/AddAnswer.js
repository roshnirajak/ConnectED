import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AddAnswer = () => {
    const navigate= useNavigate();
    const [answerContent, setAnswerContent] = useState('');
    const { questionId } = useParams();
    const [errorMessage, setErrorMessage] = useState('');

    const handleAddAnswer = async () => {

        const csrfToken = Cookies.get('csrftoken')
        try {
            if (answerContent.length <= 20 || answerContent.length > 255) {
                setErrorMessage('Answer content must be between 20 and 255 characters.');
                return;
            }
            const response = await axios.post(
                `http://169.254.37.113:8000/question/add-answer/${questionId}`,
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
            navigate(-1);
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
