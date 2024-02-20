import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://169.254.37.113:8000/user-notifications/', {
          withCredentials: true
        });
        const newCount = response.data.notifications.filter(notification => !notification.read).length;
        setNotifications(response.data.notifications);
        setNewNotificationCount(newCount);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Error fetching notifications. Please try again.');
        setLoading(false);
      }
    };

    fetchNotifications();
    handleShowNotifications()
  }, []);

  const handleShowNotifications = () => {
    setShowNotifications(true);
    setNewNotificationCount(0); // Mark all notifications as read
  };

  return (
    <div>
      <div className="notifications-container">
        {/* {loading && <p>Loading notifications...</p>}
        {error && <p>Error: {error}</p>} */}
        {showNotifications && (
          <div>
            <h1>All Notifications</h1>
            <ul>
              {notifications.map(notification => (
                <li key={notification.id}>{notification.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
};

export default NotificationList;
