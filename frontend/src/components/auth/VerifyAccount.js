import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const VerifyAccount = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [csrfToken, setCSRFToken] = useState("");

    const handleChange = (e) => {
        setVerificationCode(e.target.value);
        setCSRFToken(Cookies.get('csrftoken'))
        console.log(csrfToken)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = Cookies.get('csrftoken'); // Fetch CSRF token
            const response = await axios.post(
                'http://169.254.37.113:8000/verify-account/',
                {
                    verification_code: verificationCode,
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                }
            );
            if (response.data.success) {
                if (response.data.user_role === "0") {
                    setSuccessMessage(response.data.success);
                    Cookies.set('email', response.data.email, { expires: 14 });
                    window.location.href = '/mentor-wait'
                }
                else {
                    Cookies.set()
                    setSuccessMessage(response.data.success);
                    Cookies.set('email', response.data.email, { expires: 14 });
                    window.location.href = '/homepage'; // Corrected syntax for redirecting
                }
            } else {
                setErrorMessage(response.data.error);
            }
        } catch (error) {
            console.error('Error verifying account:', error);
            setErrorMessage('Something went wrong. Please try again later.');
        }
    };

    return (
        <div className="form-container verification-code">
            <h1>Verify Your Account</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="verificationCode">Enter 4-digit Verification Code:</label>
                    <input
                        placeholder='X-X-X-X'
                        type="text"
                        id="verificationCode"
                        name="verificationCode"
                        value={verificationCode}
                        onChange={handleChange}
                    />
                </div>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                <button type="submit" disabled={verificationCode.length !== 4}>Submit</button>
            </form>
        </div>
    );
};

export default VerifyAccount;
