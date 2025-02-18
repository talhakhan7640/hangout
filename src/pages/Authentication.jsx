import React from 'react'
import '../assets/styles/Authentication.css'
import Login from '../components/Users/Login'

const Authentication = () => {
  return (
    <div className='authentication--container'>
       <div className='wallpaper'>
          <div className="login-form-container">
            <Login />
          </div>
       </div>
    </div>
  )
}

export default Authentication
