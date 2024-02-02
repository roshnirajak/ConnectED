import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import WelcomePage from './components/WelcomePage';
import StudentRegistrationForm from './components/auth/StudentRegistrationForm';
import MentorRegistrationForm from './components/auth/MentorRegistrationForm';
import LoginForm from './components/auth/LoginForm';
import ProfilePage from './components/ProfilePage';
import HomePage from './components/HomePage';
import AddQuestion from './components/AddQuestion';
import AdminMiddleware from './components/middleware/AdminMiddleware';
import MentorWaitPage from './components/message/MentorWaitPage';
import MentorTable from './components/admin/MentorApprovalPage';
import MentorDetailsPage from './components/admin/MentorDetailsPage';
import CSRFToken from './components/auth/CSRFToken';
const App = () => {
  const AdminProtectedMentorTable = AdminMiddleware(MentorTable);

  return (
    <BrowserRouter> {/* Ensure the useNavigate hook is inside BrowserRouter */}
      <Routes>
        <Route path="/" element={<WelcomePage />} />

        <Route path="/student-registration" element={<StudentRegistrationForm />} />
        <Route path="/mentor-registration" element={<MentorRegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />

        <Route path="/csrf" element={<CSRFToken />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/add-question" element={<AddQuestion />} />

        <Route path="/mentor-wait" element={<MentorWaitPage />} />

        <Route path="/admin/mentor-verify" element={<AdminProtectedMentorTable />} />
        <Route path="/admin/mentor-details" element={<MentorDetailsPage />} />
        {/* <Route path="/admin/mentor-verify/detail/:id" element={<MentorDetailsPage/>} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;