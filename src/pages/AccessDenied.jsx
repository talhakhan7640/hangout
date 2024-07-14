import React from "react";
import '../assets/styles/AccessDenied.css'
import { Link } from "react-router-dom";

const AccessDenied = () => {

  return (
    <div className="forbidden-access-container">
      <div className="error-msg my-auto">
        <h1 className="forbidden-heading"> <span className="code">403</span> Forbidden Access</h1>
        <p className="forbidden-tag">
          You are not authorized to access this page. Try logging in first.
        </p>
        <div>
<Link to="/users/login" className="text-xs">
                  Alredy have an accout? Login
                </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;