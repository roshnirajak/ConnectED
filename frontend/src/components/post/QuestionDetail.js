import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsDown as ThickThumbDown, faThumbsUp as ThickThumbUp } from '@fortawesome/free-solid-svg-icons'
import { faThumbsDown as ThinThumbDown, faThumbsUp as ThinThumbUp } from '@fortawesome/free-regular-svg-icons';

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
  }, []);

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


            {questionData.self_user ? (
              <React.Fragment>
                <img alt="profile" style={{
                  height: '25px',
                  width: '25px',
                  border: `1px solid ${questionData.user_role === '1' ? 'blue' : '#ddd'}`,
                  borderRadius: '50%',
                }} src={`${questionData.display_image}&size=25`} />
                <span className="question-user">{questionData.user_full_name}</span>
              </React.Fragment>
            ) : (
              <Link to={`/friend-profile/${questionData.question_user}`}>
                <img alt="profile" style={{
                  height: '25px',
                  width: '25px',
                  border: `1px solid ${questionData.user_role === '1' ? 'blue' : '#ddd'}`,
                  borderRadius: '50%',
                }} src={`${questionData.display_image}&size=25`} />
                <span className="question-user">{questionData.user_full_name}</span>
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

            {questionData.answers.map((answer) => (
              <div className="answer" key={answer.answer_id}>
                <div className="answer-box">

                  <p>{answer.answer_content}</p>


                  {answer.self_user ? (
                    <React.Fragment>
                      <img alt="profile" style={{
                        height: '25px',
                        width: '25px',
                        border: `1px solid ${answer.user_role === '1' ? 'blue' : '#ddd'}`,
                        borderRadius: '50%',
                      }} src={`${answer.display_image}&size=25`} />
                      <span className="question-user">{answer.user_full_name}</span>
                    </React.Fragment>
                  ) : (
                    <Link to={`/friend-profile/${answer.answer_user}`}>
                      <img alt="profile" style={{
                        height: '25px',
                        width: '25px',
                        border: `1px solid ${answer.user_role === '1' ? 'blue' : '#ddd'}`,
                        borderRadius: '50%',
                      }} src={`${answer.display_image}&size=25`} />
                      <span className="question-user">{answer.user_full_name}</span>
                    </Link>
                  )}

                  <br />
                  {/* Render thumbs up icon based on whether the answer is liked */}
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
                  {answer.upvotes}
                  {/* Render thumbs down icon based on whether the answer is disliked */}
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
                  {answer.downvotes}
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
