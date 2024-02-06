// HomePage.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../App.css'


const WelcomePage = () => {
useEffect=()=>{
    const email = Cookies.get('email');
    if(email){
        window.location.href='/homepage'
    }
}
    return (
        <div className="welcome-container">
            <div className="logo-container">
                <img src="connectedlogo.png" alt="Connected Logo" />
            </div>
            <h1 className="welcome-heading">Welcome to the Connect<span>ED</span>!</h1>
            <div className="button-container">
                <Link to="/student-registration">
                    <button className="register-button">Register as Student</button>
                </Link>
                <Link to="/mentor-registration">
                    <button className="register-button">Register as Mentor</button>
                </Link>
            </div>
            <p className="login-now-text">
                Already Have an Account?<span> <Link to="/login">Login Now</Link> </span>
            </p>
        </div>
    );
};

export default WelcomePage;
