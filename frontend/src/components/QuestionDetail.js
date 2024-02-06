import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../App.css'

const QuestionDetail = () => {
  const { questionId } = useParams();
  const [questionData, setQuestionData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const response = await axios.get(`http://192.168.1.7:8000/question-detail/${questionId}`);
        setQuestionData(response.data.question);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching question details:', error);
        setLoading(false);
      }
    };

    // Call the function to fetch question details
    fetchQuestionDetails();
  }, [questionId]);

  return (
    <div>
      <Link to={`/homepage`}>
        <button>Homepage</button>
      </Link>
      {loading ? (
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="question-box">
          <div className="question">
            <h1>{questionData.question_content}</h1>
            <p>User: {questionData.user_full_name}</p>
            <p>Created At: {questionData.created_at}</p>
          </div>
          <div className="answers">
            <h2>Answers</h2>
            <div className="button-container">
              <Link to={`/add-answer/${questionData.question_id}`}>
                <button>Add Answer</button>
              </Link>
            </div>
            {questionData.answers.map((answer) => (
              <div className="answer" key={answer.answer_id}>
                <div className="answer-box">
                  <p>{answer.answer_content}</p>
                  <p>User: {answer.user_full_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;
