import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faThumbsDown as ThickThumbDown,
  faThumbsUp as ThickThumbUp,
  faFlag as ThinFlag,
  faTrash as Trash
} from '@fortawesome/free-solid-svg-icons'
import {
  faThumbsDown as ThinThumbDown,
  faThumbsUp as ThinThumbUp,
  faFlag as ThickFlag
} from '@fortawesome/free-regular-svg-icons';
import Navbar from '../Navbar';


const QuestionDetail = () => {
  const { questionId } = useParams();
  const [questionData, setQuestionData] = useState({});
  const [loading, setLoading] = useState(true);
  const csrfToken = Cookies.get('csrftoken')

  useEffect(() => {
    fetchQuestionDetails();
  }, [questionId, csrfToken]);

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

  const toggleAnswerReport = async (answerId) => {
    try {
      const response = await axios.post(`http://169.254.37.113:8000/question/toggle-answer-report/${answerId}/`, null, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      if (response.status === 200) {
        console.log(response.data)
        fetchQuestionDetails()
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
    }
  };

  const toggleQuestionReport = async () => {

    setLoading(true);
    try {
      // Make a POST request to ToggleQuestionReport endpoint
      const response = await axios.post(
        `http://169.254.37.113:8000/question/toggle-question-report/${questionData.question_id}/`,
        null, // No request data needed for this endpoint
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken, // Replace with actual CSRF token
          },
        }
      );
      if (response.status === 200) {
        console.log(questionData)
        fetchQuestionDetails()

        console.log('Toggle successful');
      } else {
        console.error('Toggle failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error toggling report:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAnswer = async (answer_id) => {
    const csrfToken = Cookies.get('csrftoken');
    try {
        const response = await axios.post(
            `http://169.254.37.113:8000/question/my-answer-delete/${answer_id}/`,
            {},
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            }
        );
        console.log(response.data);
    } catch (error) {
        console.error('Error deleting question:', error);
    }
    fetchQuestionDetails()
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
            <h1>{questionData?.question_content}</h1>


            {questionData.self_user ? (
              <React.Fragment>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img alt="profile" style={{
                    height: '25px',
                    width: '25px',
                    border: `4px solid ${questionData.user_role === '1' ? '#91a2f6' : '#ddd'}`,
                    borderRadius: '50%',
                    marginRight: '5px'
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
                    marginRight: '5px'
                  }} src={`${questionData.display_image}&size=25`} />
                  <span className="question-user">{questionData.user_full_name}</span>
                </div>
              </Link>
            )}


            <p>Created At: {questionData.created_at}</p>

            <div className="flag-button" disabled={loading}>


              <span>
                <FontAwesomeIcon
                  icon={ThickFlag}
                  onClick={() => toggleQuestionReport(questionData.question_id)}
                />
              </span>
              <br />
              <span>{questionData.report_count}</span>
            </div>

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
                        marginRight: '5px'
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
                          className='thickthumb'
                          onClick={() => handleToggleUpvote(answer.answer_id)}
                        />
                      </span>
                    ) : (
                      <span>
                        <FontAwesomeIcon
                          icon={ThinThumbUp}
                          className='thinthumb'
                          onClick={() => handleToggleUpvote(answer.answer_id)}
                        />
                      </span>
                    )}
                    {answer.user_disliked ? (
                      <span>
                        <FontAwesomeIcon
                          icon={ThickThumbDown}
                          className='thickthumb'
                          onClick={() => handleToggleDownvote(answer.answer_id)}
                        />
                      </span>
                    ) : (
                      <span>
                        <FontAwesomeIcon
                          icon={ThinThumbDown}
                          className='thinthumb'
                          onClick={() => handleToggleDownvote(answer.answer_id)}
                        />
                      </span>
                    )}
                  </div>
                  <div className="answer-actions">


                    {answer.upvotes} {answer.downvotes}


                  </div>


                  {answer.self_user ? (
                    <React.Fragment>
                      <FontAwesomeIcon
                            icon={Trash}
                            className="trash-icon"
                            style={{marginTop:'-20px'}} 
                            onClick={() => {handleDeleteAnswer(answer.answer_id)}}
                        />
                    </React.Fragment>
                  ) : (
                    <>
                    </>

                  )}
                  
                  <div className="flag-button" style={{marginTop:'-80px'}} disabled={loading}>


                    <span>
                      <FontAwesomeIcon
                        icon={ThickFlag}
                        onClick={() => toggleAnswerReport(answer.answer_id)}
                      />
                    </span>
                    <br />
                    <span>{answer.report_count}</span>
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
