// HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const RemoveMentor = () => {
    return (
        <div>
           
                <div>
                    <h2>Hello User</h2>
                    <p>We are couldn't verify your designation with your ID Card</p>
                    <p>Kindly try again.</p>
                    
                </div>
           
        </div>
    );
};

export default RemoveMentor;
