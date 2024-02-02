import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MentorTable = () => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/get_all_mentors/');
        const data = await response.json();
        setMentors(data);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Mentors</h2>
      <table>
        <thead>
          <tr>
            {/* <th>Display Image</th> */}
            <th>Name</th>
            <th>Email</th>
            <th>College/University</th>
            <th>Course</th>
            <th>Active Status</th>
            <th>Verification Status</th>
            <th>Details</th>
            {/* Add other mentor data fields here */}
          </tr>
        </thead>
        <tbody>
          {mentors.map((mentor) => (
            <tr key={mentor.user_id}>

              {/* <td><img src={mentor.display_image} style={{width:'20px', height:'20px'}}/></td> */}
              <td>{mentor.full_name}</td>
              <td>{mentor.email}</td>
              <td>{mentor.college_name}</td>
              <td>{mentor.course_name}</td>
              <td>
                {(() => {
                  if (mentor.is_active) {
                    return <span style={{ color: 'green' }}>Active</span>;
                  }
                  else if (!mentor.is_active) {
                    return <span style={{ color: 'red' }}>Inactive</span>;
                  }
                  else {
                    return <span style={{ color: 'gray' }}>Unknown Status</span>;
                  }
                })()}
              </td>
              <td>
                {(() => {
                  if (mentor.user_role === '0') {
                    return <span style={{ color: 'red' }}>Not Verified</span>;
                  }
                  else if (mentor.user_role === '1') {
                    return <span style={{ color: 'green' }}>Verified</span>;
                  }
                  else if (mentor.user_role === '2') {
                    return <span style={{ color: 'orange' }}>Student</span>;
                  }
                  else {
                    return <span style={{ color: 'gray' }}>Unknown Status</span>;
                  }
                })()}
              </td>
              <td><Link to={`/admin/mentor-details?id=${encodeURIComponent(mentor.email)}`}>Details</Link>
              
              </td>
              {/* Add other mentor data fields here */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MentorTable;
