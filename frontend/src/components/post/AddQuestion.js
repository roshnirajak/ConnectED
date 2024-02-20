import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../Navbar';

const AddQuestion = () => {
    const navigate = useNavigate();
    const [questionContent, setQuestionContent] = useState('');
    const [subject, setSubject] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        // Check if the entered character is an English letter or a space
        if (/^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]*$/.test(inputValue)) {
            setQuestionContent(inputValue);
        }
    };

    const handleAddQuestion = async () => {
        const csrfToken = Cookies.get('csrftoken')
        try {
            // Validate input lengths
            
            if (questionContent.length <= 20 || questionContent.length > 200) {
                setErrorMessage('Question content must be less than 200 characters.');
                return;
            }
            else if (subject.length < 3 || subject.length > 20) {
                setErrorMessage('Subject must be between 3 and 20 characters.');
                return;
            }

            // Make API request using Axios
            const response = await axios.post(
                'http://169.254.37.113:8000/question/add-question/',
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
            navigate(-1);
        } catch (error) {
            // Handle error
            console.error('Error adding question:', error);
            setErrorMessage('Your Question is quite offensive.');
        }
    };

    return (
        <div>
            <div className="add-question-container">
                <h1>Add Question</h1>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <div>
                    <label>Question Content:</label>
                    <textarea
                        placeholder='Enter your Question...'
                        rows={5}
                        value={questionContent} 
                        onChange={handleInputChange}
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
            <Navbar />
        </div>
    );
};

export default AddQuestion;
