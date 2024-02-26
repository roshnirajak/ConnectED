import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTrash as Trash
  } from '@fortawesome/free-solid-svg-icons'

const ReportedQuestion = () => {
    const [reportedQuestions, setReportedQuestions] = useState([]);
    useEffect(() => {
        

        fetchReportedQuestions();
    }, []);
    
    
    const fetchReportedQuestions = async () => {
        try {
            const response = await axios.get('http://169.254.37.113:8000/question/get-reported-question/', {}, {
                withCredentials: true,
            });
            console.log(response.data.questions)
            setReportedQuestions(response.data.questions);
        } catch (error) {
            console.error('Error fetching reported questions:', error);
        }
    };
    const handleDeleteQuestion = async (question_id) => {
        const csrfToken = Cookies.get('csrftoken');
        try {
            const response = await axios.post(
                `http://169.254.37.113:8000/question/admin-question-delete/${question_id}/`,
                null,
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
        fetchReportedQuestions()
    };
    return (
        <div className="reported-questions-container">
            <h2>Reported Questions</h2>
            <table className="reported-questions-table">
                <thead>
                    <tr>
                        <th>Question Content</th>
                        <th>Asked By</th>
                        <th>Community</th>
                        <th>Reoprt Count</th>
                        <th>Delete Question</th>

                    </tr>
                </thead>
                <tbody>
                    {reportedQuestions.map((question) => (
                        <tr key={question.question_id}>
                            <td>{question.question_content}</td>
                            <td>{question.user_full_name}</td>
                            <td>{question.community === 1 ? 'BCA' :
                                question.community === 2 ? 'BCom' :
                                    question.community === 3 ? 'BCom Hons' :
                                        question.community === 4 ? 'BBA' :
                                            'Unknown Course'}</td>
                            <td>{question.report_count}</td>
                            <td><FontAwesomeIcon
                            icon={Trash}
                            className="trash-icon"
                            style={{marginTop:'-20px'}} 
                            onClick={() => {handleDeleteQuestion(question.question_id)}}
                        /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportedQuestion;
