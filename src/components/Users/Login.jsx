import React, { useState } from "react";
import "../../assets/styles/Login.css"; // CSS file for styling
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

const Login = () => {
  const navigate = useNavigate();
  const cookie = new Cookies();

  const [loginCredentials, setLoginCredentials] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = "https://hagnout-backend.onrender.com/users/login";

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginCredentials),
    })
      .then((response) => {
        if (response.status === 200) {
          setInterval(() => {
            navigate("/hangout/rooms");
          }, 5000);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        cookie.set("TOKEN", data.token, { path: "/" });
        cookie.set("username", loginCredentials.username, { path: "/" });
        cookie.set("senderId", data.userId, { path: "/" });
        cookie.set("profilePic", data.profilePic, { path: "/" });
        setMessage(data.message);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="login--page fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="alert p-0 mb-4">
          <span className="text-red-500 font-semibold">{message}</span>
        </div>
        <div className="login-header mb-4">
          <h2 className="text-3xl text-white mb-2">
            <span className="italic">#hangout says: </span>おかえり 😊
          </h2>
          <p className="text-gray-300">
            Join the conversation with friends with some lofi beats.
          </p>
        </div>
        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              onChange={(e) =>
                setLoginCredentials({
                  ...loginCredentials,
                  username: e.target.value,
                })
              }
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <div className="form-group">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              onChange={(e) =>
                setLoginCredentials({
                  ...loginCredentials,
                  password: e.target.value,
                })
              }
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <div className="form-group text-right">
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="form-group">
            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 text-white rounded-md w-full"
              onClick={handleSubmit}
            >
              Log in
            </button>
          </div>
          <div className="form-links text-center mt-4">
            <p className="text-sm text-gray-300">
              <Link
                to="/users/signup"
                className="text-blue-500 hover:underline"
              >
                Need an account? Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
