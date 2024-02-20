import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
import { useLocation, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const MentorDetailsPage = () => {
    const location = useLocation();
    const { id } = useParams();
    const [userProfile, setUserProfile] = useState(null);
    const [verificationMessage, setVerificationMessage] = useState('');
    
    const csrfToken = Cookies.get('csrftoken');

    useEffect(() => {
        const fetchMentorDetails = async () => {
            try {
                const response = await fetch(`http://169.254.37.113:8000/api/get_mentor/${id}/`, {
                    method: 'GET',
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch mentor details');
                }
                const data = await response.json();
                console.log('Mentor profile data:', data);
                setUserProfile(data.mentors); // Assuming the mentor data is returned under the key "mentor"
            } catch (error) {
                console.error('Error fetching mentor details:', error);
            }
        };

        fetchMentorDetails();
    }, [id]);

    if (!userProfile) {
        return <div>Loading...</div>;
    }

    const handleVerifyMentor = async () => {
        try {
            console.log(csrfToken);
            const response = await axios.post(
                `http://169.254.37.113:8000/api/verify_mentor/${userProfile.user_id}/`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                }
            );
    
            setVerificationMessage('Mentor Verified');

        } catch (error) {
            console.error('Error verifying mentor:', error);
            setVerificationMessage('Something went wrong');
        }
    };
    return (
        <div>

            {/* Render user details from userDetails state */}
            {userProfile ? (
                <div>
                    <h2>mentor Details</h2>
                    <p><strong>Profile Image:</strong> <br /><img alt="profile" style={{ border: '1px solid #ddd', borderRadius: '50%', width: '250px', height: '250px' }} src={userProfile.display_image} /> </p>
                    <p><strong>Name:</strong> {userProfile.full_name}</p>
                    <p><strong>Email:</strong> {userProfile.email}</p>
                    <p><strong>Designation:</strong> {userProfile.designation}</p>
                    <p><strong>Community:</strong> {userProfile.community_id}</p>
                    <p>
                        <strong>Mentor Image:</strong>
                        <br />
                        <img src={`data:image/png;base64, ${userProfile.mentor_id_card_data}`} style={{ border: '1px solid #ddd', height: '250px' }} alt="Mentor ID" />
                    </p> 
                    <p>
                        <button onClick={handleVerifyMentor}>Verify Mentor</button>
                    </p>
                    {verificationMessage && <p>{verificationMessage}</p>}
                    <p><button>Deaavtivate Mentor</button></p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default MentorDetailsPage;
