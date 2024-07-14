import React from 'react'
import '../assets/styles/Authentication.css'
import Login from '../components/Users/Login'

const Authentication = () => {
  return (
    <div className='authentication--container'>
      {/* <h1 className='logo text-4xl font-bold text-white pt-10 mx-64'>#hangout</h1> */}
       <div className='wallpaper'>
          <div className="login-form-container">
            <Login />
          </div>
       </div>
    </div>
  )
}

export default Authentication