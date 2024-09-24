import React, {useEffect} from 'react'
import '../assets/styles/Index.css';
import Rooms from '../components/Application/Rooms';
import { Outlet, useOutlet } from 'react-router-dom';
import Cookies from "universal-cookie";
import AccessDenied from "../pages/AccessDenied";
import MusicPlayer from '../components/Application/MusicPlayer';

const Index = () => {
  useEffect(() => {
    if (!sessionStorage.getItem('firstLoadDone')) {
      sessionStorage.setItem('firstLoadDone', 'true');
      window.location.reload();
    }
  }, []);
  const cookie = new Cookies();

  const outlet = useOutlet();

  if (cookie.get("TOKEN") === undefined) {
    return (
      <div>
        <AccessDenied />
      </div>
    );
  } else {
  return (
    <div className="index--layout">
      <div className="grid grid-cols-12 h-screen">
    <div className="chat--rooms col-span-2 xl:col-span-2">
          <Rooms />
        </div>

    <div className={`chat--window--drawer col-span-10 xl:col-span-10 ${
              outlet ? '' : 'flex justify-center items-center'
            }`}>
   
    {outlet? (
          <Outlet />
    ) : (
      <div className="select--room--message flex justify-center align-center ">
   <h1 className=''>Select room to start conversation</h1>
              </div>
    )}
        </div>


      </div>
    </div>
  );
}
}

export default Index
