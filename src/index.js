import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Users/Signup.jsx';
import Index from './pages/Index.jsx';
import ChatWindow from './components/Application/ChatWindow.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/users/login" />} />

      <Route path="users/">
        <Route path="login" element={<App />} />
        <Route path="signup" element={<Signup />} />
      </Route>

      <Route path="/hangout/rooms" element={<Index />}>
        <Route path="room">
          <Route path=":roomName">
            <Route path=":roomid" element={<ChatWindow />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
