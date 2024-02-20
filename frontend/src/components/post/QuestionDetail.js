import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsDown as ThickThumbDown, faThumbsUp as ThickThumbUp } from '@fortawesome/free-solid-svg-icons'
import { faThumbsDown as ThinThumbDown, faThumbsUp as ThinThumbUp } from '@fortawesome/free-regular-svg-icons';
import Navbar from '../Navbar';


const QuestionDetail = () => {
  const { questionId } = useParams();
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
  }, [questionId, csrfToken]);

  const handleToggleUpvote = async (answerId) => {
    try {
      const response = await axios.post(`http://169.254.37.113:8000/question/toggle_upvote/${answerId}`, {
        answerid: answerId,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      if (response.status === 200) {
        // Update the state of the liked answer
        setQuestionData(prevQuestionData => ({
          ...prevQuestionData,
          answers: prevQuestionData.answers.map(answer => {
            if (answer.answer_id === answerId) {
              return {
                ...answer,
                user_liked: !answer.user_liked,
                upvotes: answer.user_liked ? answer.upvotes - 1 : answer.upvotes + 1
              };

            }
            return answer;
          })
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };


  const handleToggleDownvote = async (answerId) => {
    try {
      const response = await axios.post(`http://169.254.37.113:8000/question/toggle_downvote/${answerId}`, {
        answerid: answerId,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      if (response.status === 200) {
        console.log(response.data)
        setQuestionData(prevQuestionData => ({
          ...prevQuestionData,
          answers: prevQuestionData.answers.map(answer => {
            if (answer.answer_id === answerId) {
              return {
                ...answer,
                user_disliked: !answer.user_disliked,
                downvotes: answer.user_disliked ? answer.downvotes + 1 : answer.downvotes - 1
              };
            }
            return answer;
          })
        }));
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="question-box">
          <div className="question">
            <h1>{questionData.question_content}</h1>


            {questionData.self_user ? (
              <React.Fragment>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img alt="profile" style={{
                    height: '25px',
                    width: '25px',
                    border: `4px solid ${questionData.user_role === '1' ? '#91a2f6' : '#ddd'}`,
                    borderRadius: '50%',
                    marginRight:'5px'
                  }} src={`${questionData.display_image}&size=25`} />
                  <span className="question-user">{questionData.user_full_name}</span>
                </div>
              </React.Fragment>
            ) : (
              <Link to={`/friend-profile/${questionData.question_user}`}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img alt="profile" style={{
                    height: '25px',
                    width: '25px',
                    border: `4px solid ${questionData.user_role === '1' ? '#91a2f6' : '#ddd'}`,
                    borderRadius: '50%',
                    marginRight:'5px'
                  }} src={`${questionData.display_image}&size=25`} />
                  <span className="question-user">{questionData.user_full_name}</span>
                </div>
              </Link>
            )}


            <p>Created At: {questionData.created_at}</p>
          </div>
          <div className="answers">
            <h2>Answers</h2>
            <div className="button-container">
              <Link to={`/add-answer/${questionData.question_id}`}>
                <button>Add Answer</button>
              </Link>
            </div>
            <br />
            {questionData.answers.map((answer) => (
              <div className="answer" key={answer.answer_id}>
                <div className="answer-box">

                  <p><strong>{answer.answer_content}</strong></p>


                  {answer.self_user ? (
                    <React.Fragment>
                      <img alt="profile" style={{
                        height: '25px',
                        width: '25px',
                        border: `4px solid ${answer.user_role === '1' ? '#91a2f6' : '#ddd'}`,
                        borderRadius: '50%',
                        marginRight:'5px'
                      }} src={`${answer.display_image}&size=25`} />
                       <span className="question-user">{answer.user_full_name}</span>
                    </React.Fragment>
                  ) : (
                    <Link to={`/friend-profile/${answer.answer_user}`}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img alt="profile" style={{
                          height: '25px',
                          width: '25px',
                          border: `4px solid ${answer.user_role === '1' ? '#91a2f6' : '#ddd'}`,
                          borderRadius: '50%',
                          marginRight: '5px',
                        }} src={`${answer.display_image}&size=25`} />

                        <span className="question-user">{answer.user_full_name}</span>
                      </div>
                    </Link>
                  )}

                  <br />
                  {/* Render thumbs up icon based on whether the answer is liked */}
                  <div className="answer-actions">
                    {answer.user_liked ? (
                      <span>
                        <FontAwesomeIcon
                          icon={ThickThumbUp}
                          onClick={() => handleToggleUpvote(answer.answer_id)}
                        />
                      </span>
                    ) : (
                      <span>
                        <FontAwesomeIcon
                          icon={ThinThumbUp}
                          onClick={() => handleToggleUpvote(answer.answer_id)}
                        />
                      </span>
                    )}
                    {answer.user_disliked ? (
                      <span>
                        <FontAwesomeIcon
                          icon={ThickThumbDown}
                          onClick={() => handleToggleDownvote(answer.answer_id)}
                        />
                      </span>
                    ) : (
                      <span>
                        <FontAwesomeIcon
                          icon={ThinThumbDown}
                          onClick={() => handleToggleDownvote(answer.answer_id)}
                        />
                      </span>
                    )}
                  </div>
                  <div className="answer-actions">


                    {answer.upvotes} {answer.downvotes}

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <br /><br /><br /><br />
      <Navbar />
    </div>
  );
};

export default QuestionDetail;
