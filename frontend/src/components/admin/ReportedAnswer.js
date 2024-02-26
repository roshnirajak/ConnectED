import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTrash as Trash
  } from '@fortawesome/free-solid-svg-icons'

const ReportedAnswer = () => {
    const [reportedAnswers, setReportedAnswers] = useState([]);
    useEffect(() => {
        

        fetchReportedAnswers();
    }, []);
    
    
    const fetchReportedAnswers = async () => {
        try {
            const response = await axios.get('http://169.254.37.113:8000/question/get-reported-answer/', {}, {
                withCredentials: true,
            });
            console.log(response.data.questions)
            setReportedAnswers(response.data.questions);
        } catch (error) {
            console.error('Error fetching reported questions:', error);
        }
    };
    const handleDeleteQuestion = async (answer_id) => {
        const csrfToken = Cookies.get('csrftoken');
        try {
            const response = await axios.post(
                `http://169.254.37.113:8000/question/admin-answer-delete/${answer_id}/`,
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
        fetchReportedAnswers()
    };
    return (
        <div className="reported-questions-container">
            <h2>Reported Questions</h2>
            <table className="reported-questions-table">
                <thead>
                    <tr>
                        <th>Answer Content</th>
                        <th>Answered By</th>
                        <th>Community</th>
                        <th>Reoprt Count</th>
                        <th>Delete Answer</th>

                    </tr>
                </thead>
                <tbody>
                    {reportedAnswers.map((answer) => (
                        <tr key={answer.answer_id}>
                            <td>{answer.answer_content}</td>
                            <td>{answer.user_full_name}</td>
                            <td>{answer.community === 1 ? 'BCA' :
                                answer.community === 2 ? 'BCom' :
                                answer.community === 3 ? 'BCom Hons' :
                                    answer.community === 4 ? 'BBA' :
                                            'Unknown Course'}</td>
                            <td>{answer.report_count}</td>
                            <td><FontAwesomeIcon
                            icon={Trash}
                            className="trash-icon"
                            style={{marginTop:'-20px'}} 
                            onClick={() => {handleDeleteQuestion(answer.answer_id)}}
                        /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportedAnswer;
