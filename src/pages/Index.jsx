import React, { useEffect } from "react";
import "../assets/styles/Index.css";
import Rooms from "../components/Application/Rooms";
import { Outlet, useOutlet } from "react-router-dom";
import Cookies from "universal-cookie";
import AccessDenied from "../pages/AccessDenied";
import MusicPlayer from "../components/Application/MusicPlayer";

const Index = () => {
  useEffect(() => {
    if (!sessionStorage.getItem("firstLoadDone")) {
      sessionStorage.setItem("firstLoadDone", "true");
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
          <div className="chat--rooms hidden md:block md:col-span-2 lg:col-span-3 xl:col-span-2">
            <Rooms />
          </div>

          <div
            className={`chat--window--drawer col-span-12 md:col-span-10 lg:col-span-9 xl:col-span-10 ${
              outlet ? "" : "flex justify-center items-center"
            }`}
          >
            {outlet ? (
              <Outlet />
            ) : (
                <div className="select--room--message flex justify-center w-full">
                  {/* Display Rooms only on mobile */}
                  <div className="block md:hidden w-full">
                    <Rooms />
                  </div>

                  {/* Show prompt only on desktop */}
                  <h1 className="hidden md:block">Select room to start conversation</h1>
                </div>
            )}
          </div>
        </div>

      </div>
    );
  }
};

export default Index;
