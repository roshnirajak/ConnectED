import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AddCommunity = () => {
    const [newCommunity_name, setNewCommunityName] = useState('');
    const [newCommunity_id, setNewCommunityId] = useState('');
    const [communities, setCommunities] = useState([]);
    const [error, setError] = useState('');
    const csrfToken = Cookies.get('csrftoken');

    const fetchCommunityData = async () => {
        try {
            const response = await axios.get('http://169.254.37.113:8000/api/get_all_community/', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                }
            });
            setCommunities(response.data.communities);
        } catch (error) {
            console.error('Error fetching community data:', error);
        }
    };

    useEffect(() => {
        fetchCommunityData();
    }, []);

    const handleAddCommunity = async () => {
        try {
            const response = await axios.post('http://169.254.37.113:8000/api/add_community/', {
                name: newCommunity_name,
                id: newCommunity_id,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });

            if (response.status === 201) {
                setNewCommunityName('');
                setNewCommunityId('')
                fetchCommunityData();
                console.log('Community added successfully:', response.data);
            } else {
                setError('Failed to add community');
            }
        } catch (error) {
            setError('Failed to add community');
            console.error('Error adding community:', error);
        }
    };

    return (
        <div className="add-community-container">
            <div className="add-community-form">
                <h2>Add Community</h2>
                <label>Community:</label>
                <input
                    type="text"
                    value={newCommunity_id}
                    onChange={(e) => setNewCommunityId(e.target.value)}
                    placeholder="Enter community ID"
                    required
                />
                <input
                    type="text"
                    value={newCommunity_name}
                    onChange={(e) => setNewCommunityName(e.target.value)}
                    placeholder="Enter community Name"
                    required
                />
                <button onClick={handleAddCommunity}>Add</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>

            <div className="add-community-table">
                <h3>Communities</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Community ID</th>
                            <th>Community Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {communities.map(community => (
                            <tr key={community.community_id}>
                                <td>{community.community_id}</td>
                                <td>{community.community_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AddCommunity;

