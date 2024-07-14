import React from 'react'
import '../../assets/styles/Index.css';
import MusicPlayer from '../../components/Application/MusicPlayer';
import Rooms from '../../components/Application/Rooms';
import ChatWindow from '../../components/Application/ChatWindow';
import { Outlet } from 'react-router-dom';
import Cookies from "universal-cookie";
import AccessDenied from "../../pages/AccessDenied";

const Layout = () => {
  return (
   <div className='index--layout'>
      <div className='grid grid-cols-12'>

        <div className='chat--rooms col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-3'> 
            <Rooms />
        </div>

        <div className='col-span-10 chat--window--drawer sm:col-span-8 md:col-span-6 lg:col-span-6'>
          <Outlet />
        </div>


           <div className='hidden music--player sm:block sm:col-span-2 md:col-span-4 lg:col-span-3'>
          Music Player
        </div>
      </div>
    </div>  
  )
}

export default Layout