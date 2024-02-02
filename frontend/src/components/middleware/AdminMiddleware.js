import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const withAdminMiddleware = (WrappedComponent) => {
  return (props) => {
    const navigate = useNavigate();

    useEffect(() => {
      // Your middleware logic goes here
      const userEmail = Cookies.get('email');
      console.log('User Email:', userEmail);
      if (userEmail !== 'imroshni3@gmail.com') {
        console.log('not redirect:');
        // Redirect to the student registration page if not admin
        navigate('/student-registration');
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
};

export default withAdminMiddleware;
