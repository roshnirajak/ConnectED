import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../Navbar';

const AddAnswer = () => {
  const navigate = useNavigate();
  const [answerContent, setAnswerContent] = useState('');
  const { questionId } = useParams();
  const [errorMessage, setErrorMessage] = useState('');
  const [questionData, setQuestionData] = useState({});
  const [loading, setLoading] = useState(true);
  const csrfToken = Cookies.get('csrftoken')
  useEffect(() => {

    const fetchQuestionDetails = async () => {
      try {
        const response = await axios.get(`http://169.254.37.113:8000/question/question-detail/${questionId}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          }
        });
        setQuestionData(response.data.question);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching question details:', error);
        setLoading(false);
      }
    };

    fetchQuestionDetails();
  }, []);
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
    <>
      <div className="add-answer-container">
        <h1>Add Answer</h1>
        <h3>{questionData.question_content}</h3>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img alt="profile" style={{
                height: '25px',
                width: '25px',
                border: `3px solid ${questionData.user_role === '1' ? '#91a2f6' : '#ddd'}`,
                borderRadius: '50%',
              }} src={`${questionData.display_image}&size=25`} />
              <span className="question-user">{questionData.user_full_name}</span>
            </div>


        {/* Add your input fields and form structure here */}
        <textarea
          value={answerContent}
          onChange={(e) => setAnswerContent(e.target.value)}
          placeholder="Enter your answer"
        />
        <button onClick={handleAddAnswer}>Add Answer</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
      <Navbar />
    </>
  );
};

export default AddAnswer;
