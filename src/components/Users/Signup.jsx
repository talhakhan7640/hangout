import React, { useState } from "react";
import '../../assets/styles/Signup.css';
import { Link } from 'react-router-dom';

const Signup = () => {
    const [signupCredentials, setSignupCredentials] = useState({
    username: "",
    email: "",
    password: "",
  });
   const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    console.log("hi mom, look i can fly")
    e.preventDefault();

    const url = "https://hagnout-backend.onrender.com/users/signup";

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupCredentials),
    })
      .then((response) => {
         if (response.status == 201) {
          setInterval(() => {
            window.location.assign("/users/login");
          }, 2000);
        }
        return response.json();
      })
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.log(error);
      });
  };
//  return (
//     <div className="center-container">
//       {/* <h1 className='text-white text-4xl'>#hangout</h1> */}
       
//       <div className="login-container">
//          <div className="alert p-0">
//           <span className="text-red-500 font-semibold">{message}</span>
//         </div>
//         <div className="login-header">
//           <h2 className='text-3xl'><span className='italic'>#hangout says: </span>
// いらっしゃいませ 😊</h2>
//           <p>Join the conversation with friends with some lofi beats.</p>
//         </div>
//         <form id="login-form">
//           <div className="form-group">
//             <label htmlFor="username">Username</label>
//             <input type="text" id="username" name="username" required onChange={(e) => setSignupCredentials({...signupCredentials, username: e.target.value})}/>
//           </div>
//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input type="email" id="email" name="email" required onChange={(e) => setSignupCredentials({...signupCredentials, email: e.target.value})}/>
//           </div>
//           <div className="form-group">
//             <label htmlFor="password">Password</label>
//             <input type="password" id="password" name="password" required onChange={(e) => setSignupCredentials({...signupCredentials, password: e.target.value})}/>
//           </div>
//           {/* <div className="form-group">
//             <a href="#" className="forgot-password-link">Forgot password?</a>
//           </div> */}
//           <div className="form-group">
//             <button type="submit" onClick={handleSubmit}>Signup</button>
//           </div>
//           <div className="form-links">
//           <p className="register-link">
//               <Link to="/users/login"> 
//              Already have an account?  Login
//               </Link>
//             </p> 
//           </div>
//         </form>
//       </div>
//     </div>
//   ); 

return (
    <div className="signup--page fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12">
        <div className="alert p-0 mb-4">
          <span className="text-red-500 font-semibold">{message}</span>
        </div>
        <div className="login-header mb-4">
          <h2 className='text-3xl text-white mb-2'><span className='italic'>#hangout says: </span>いらっしゃいませ 😊</h2>
          <p className='text-gray-300'>Join the conversation with friends with some lofi beats.</p>
        </div>
        <form id="signup-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              onChange={(e) => setSignupCredentials({ ...signupCredentials, username: e.target.value })}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              onChange={(e) => setSignupCredentials({ ...signupCredentials, email: e.target.value })}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              onChange={(e) => setSignupCredentials({ ...signupCredentials, password: e.target.value })}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <div className="form-group">
            <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-md w-full" onClick={handleSubmit}>Signup</button>
          </div>
          <div className="form-links text-center mt-4">
            <p className="text-sm text-gray-300">
              <Link to="/users/login" className="text-blue-500 hover:underline">Already have an account? Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup