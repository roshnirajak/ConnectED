// UserDetailsPage.js
import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const MentorDetailsPage = () => {
    const location = useLocation();
    const userID = new URLSearchParams(location.search).get('id');
    const [userProfile, setUserProfile] = useState(null);
    const [verificationMessage, setVerificationMessage] = useState('');

    useEffect(() => {
        const fetchMentorDetails = async () => {
            try {
                fetch(`http://localhost:8000/api/get_user_profile/?email=${encodeURIComponent(userID)}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch user profile');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('User profile data:', data);
                        setUserProfile(data);

                    })

            } catch (error) {
                console.error('Error fetching mentor details:', error);
            }
        };

        fetchMentorDetails();
    }, [userID]);

    if (!userProfile) {
        return <div>Loading...</div>;
    }
    // Render user details here
    const handleVerifyMentor = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/verify_mentor/${userProfile.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setVerificationMessage(data.message);
            } else {
                setVerificationMessage('Something went wrong');
            }
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
                    <p><strong>College:</strong> {userProfile.college_name}</p>
                    <p><strong>Community:</strong> {userProfile.community_id}</p>
                    <p><strong>Identity card Image:</strong> <br />
                    
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
