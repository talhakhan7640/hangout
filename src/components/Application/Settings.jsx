import React from 'react';
import ReactDOM from 'react-dom';
import "../../assets/styles/Settings.css"

const Settings = ({ onClose }) => {
  return ReactDOM.createPortal(
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button onClick={onClose}>X</button>
        </div>
        <div className="settings-content">
          <h3>User Settings</h3>
          <ul>
            <li>Profile</li>
            <li>Privacy & Safety</li>
            <li>Authorized Apps</li>
            <li>Connections</li>
          </ul>
          <h3>App Settings</h3>
          <ul>
            <li>Appearance</li>
            <li>Accessibility</li>
            <li>Voice & Video</li>
            <li>Notifications</li>
          </ul>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Settings;
