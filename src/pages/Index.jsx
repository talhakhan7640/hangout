import React, {useState ,useEffect} from 'react'
import '../assets/styles/Index.css';
import Rooms from '../components/Application/Rooms';
import ChatWindow from '../components/Application/ChatWindow';
import { Outlet } from 'react-router-dom';
import Cookies from "universal-cookie";
import AccessDenied from "../pages/AccessDenied";
import { useSelector } from 'react-redux';

const Index = () => {
  useEffect(() => {
    if (!sessionStorage.getItem('firstLoadDone')) {
      sessionStorage.setItem('firstLoadDone', 'true');
      window.location.reload();
    }
  }, []);
const cookie = new Cookies();
  if (cookie.get("TOKEN") === undefined) {
    return (
      <div>
        <AccessDenied />
      </div>
    );
  } else {
  return (
    <div className="index--layout">
      {/* <div className='block sm:hidden text-4xl font-extrabold text-center my-auto py-auto'>Sorry, hangout is not available for this resolution. Mobile application will be available soon.</div> */}
      <div className="grid grid-cols-12">
        <div className="chat--rooms col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2">
          <Rooms />
        </div>

        <div className="col-span-10 chat--window--drawer sm:col-span-10 md:col-span-10 lg:col-span-10">
          <Outlet />
        </div>

        {/* <div className='hidden music--player sm:block sm:col-span-2 md:col-span-4 lg:col-span-3'>  */}
        {/* <MusicPlayer /> */}
        {/* Music Player */}
        {/* </div> */}
      </div>
    </div>
  );
}
}

export default Index
