import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import WelcomePage from './components/WelcomePage';
import StudentRegistrationForm from './components/auth/StudentRegistrationForm';
import MentorRegistrationForm from './components/auth/MentorRegistrationForm';
import LoginForm from './components/auth/LoginForm';
import ProfilePage from './components/ProfilePage';
import FriendProfilePage from './components/FriendProfilePage';
import HomePage from './components/HomePage';
import AddQuestion from './components/post/AddQuestion';
import AddAnswer from './components/post/AddAnswer';

import NotificationList from './components/Notifications';

import MessagePage from './components/message/MessagePage';
import Chatbox from './components/message/ChatBox';
import MyQuestions from './components/MyQuestions';
import VerifyAccount from './components/auth/VerifyAccount';
import Settings from './components/Setting';
import QuestionDetail from './components/post/QuestionDetail';
import AdminPanel from './components/admin/AdminPanel';
import MentorWaitPage from './components/MentorWaitPage';
import MentorTable from './components/admin/MentorTablePage';
import MentorDetailsPage from './components/admin/MentorDetailsPage';
const App = () => {

  return (
    <BrowserRouter> {/* Ensure the useNavigate hook is inside BrowserRouter */}
      <Routes>
        <Route path="/" element={<WelcomePage />} />

        <Route path="/student-registration" element={<StudentRegistrationForm />} />
        <Route path="/mentor-registration" element={<MentorRegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />


        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/add-question" element={<AddQuestion />} />
        <Route path="/add-answer/:questionId" element={<AddAnswer />} />
        <Route path="/question-detail/:questionId" element={<QuestionDetail />} />
        
        <Route path="/notifications" element={<NotificationList />} />

        <Route path="/verify-account" element={<VerifyAccount />} />

        <Route path="/my-questions" element={<MyQuestions />} />

        <Route path="/message" element={<MessagePage />} />

        <Route path="/chat/:userId" element={<Chatbox/>} />
        <Route path="/friend-profile/:userId" element={<FriendProfilePage />} />

        <Route path="/mentor-wait" element={<MentorWaitPage />} />
      
        <Route path="/settings" element={<Settings />} />

        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/mentor-table" element={<MentorTable />} />

        <Route path="/admin/mentor-verify/detail/:id" element={<MentorDetailsPage/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;