import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const MentorTable = () => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const csrfToken = Cookies.get('csrftoken');
    const fetchData = async () => {
      try {
        const emailFromCookies = Cookies.get('email'); // Get email from cookies
        if (emailFromCookies === 'xyz@mail.com') {
          const response = await fetch('http://169.254.37.113:8000/api/get_all_mentors/', {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            }
          });
          const data = await response.json();
          setMentors(data.mentors);
        } else {
          // Email in cookies doesn't match, do nothing
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="mentor-list-container">
      <h2>Verify Mentor</h2>
      <table className="mentor-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Designation</th>
            <th>Community</th>
            <th>Active Status</th>
            <th>Verification Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {mentors.map((mentor) => (
            <tr key={mentor.user_id}>
              <td>{mentor.full_name}</td>
              <td>{mentor.email}</td>
              <td>{mentor.designation}</td>
              <td className="community">
                {(() => {
                  if (mentor.community_id === 1) {
                    return <span>BCA</span>;
                  } else if (mentor.community_id === 2) {
                    return <span>BCom</span>;
                  } else if (mentor.community_id === 3) {
                    return <span>BCom Hons.</span>;
                  } else if (mentor.community_id === 4) {
                    return <span>BBA</span>;
                  } else {
                    return <span>Unknown Community</span>;
                  }
                })()}
              </td>
              <td className="active-status">
                {mentor.is_active ? (
                  <span className="active">Active</span>
                ) : (
                  <span className="inactive">Inactive</span>
                )}
              </td>
              <td className="verification-status">
                {mentor.user_role === '0' ? (
                  <span className="not-verified">Not Verified</span>
                ) : mentor.user_role === '1' ? (
                  <span className="verified">Verified</span>
                ) : mentor.user_role === '2' ? (
                  <span className="student">Student</span>
                ) : (
                  <span className="unknown">Unknown Status</span>
                )}
              </td>
              <td>
                <Link to={`/admin/mentor-verify/detail/${encodeURIComponent(mentor.user_id)}`}>
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MentorTable;
