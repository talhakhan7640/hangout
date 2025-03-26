import React, { useState, useEffect } from "react";
import { CiSettings } from "react-icons/ci";
import { IoIosAddCircleOutline } from "react-icons/io";
import { BiSolidMicrophone, BiSolidMicrophoneOff } from "react-icons/bi";
import "../../assets/styles/Rooms.css";
import CreateRoom from "./CreateRoom";
import { createPortal } from "react-dom";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import {connect} from "socket.io-client";

const Rooms = () => {
  const navigate = useNavigate();
  const cookies = new Cookies();

  // getting username from cookies
  const username = cookies.get("username");
  const profilePic = cookies.get("profilePic");

  // room states
  const [rooms, setRooms] = useState([]);
  const [searchedRooms, setSearchedRooms] = useState([]);
  const [message, setMessage] = useState("");
  const [joinText, setJoinText] = useState("Join");
  const [gif, setGIF] = useState("");
  const [activeRoomId, setActiveRoomId] = useState("");

  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  // for searching room with name
  const [roomName, setRoomName] = useState("");

  //Toggle setting popup
  const [isSettingPopupVisible, setIsSettingPopupVisible] = useState(false);

  // Toggle microphone
  const [isMute, setIsMute] = useState(false);

  const toggleMicrophone = () => {
    setIsMute(!isMute);
  };

  const togglePopup = () => {
    setIsSettingPopupVisible(!isSettingPopupVisible);
  };

  const handleChangeRoomName = (e) => {
    setRoomName(e.target.value);
  };

  // fetch rooms the current user has joined
  useEffect(() => {
    //const url = "https://hagnout-backend.onrender.com/rooms/fetch-rooms/";
    const url = "http://localhost:5000/rooms/fetch-rooms/";


    // FOR EDUCATIONAL PURPOSE ONLY ---- NOT SUITABLE FOR PRODUCTION
    //const cookies = document.cookie.token;
    //
    //function getCookie(name) {
    //  const cookies = document.cookie.split('; ');
    //  console.log(cookies);
    //  for (const cookie of cookies) {
    //    const [key, value] = cookie.split('=');
    //    if (key === name) {
    //      return value;
    //    }
    //  }
    //  return null; // Return null if cookie not found
    //}

    //const manualToken = getCookie("manualToken");
    //console.log("manual token", manualToken);
    //

    const response = fetch(url, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      if (response.status === 401) { 
        // If unauthorized, try to read it as text (HTML)
        const htmlContent = response.text();
        document.body.innerHTML = htmlContent; // Replace current page with the received HTML
        return;
      }
    }

    response
      .then((response) => response.json())
      .then((data) => {
        setRooms(data);
      });

    const reverseRoomId = (roomid) => {
      var splitRoomId = roomid.split("");

      var reverseRoomId = splitRoomId.reverse();

      var joinRoomId = reverseRoomId.join("");

      return joinRoomId;
    };

    let currentRoomId = "";
    for (
    var i = window.location.href.length - 1;
    i >= window.location.href.length - 24;
    i--
  ) {
      currentRoomId += window.location.href[i];
    }

    setGifForCurrentRoom(reverseRoomId(currentRoomId));
  }, [username]);

  // search room
  const handleSearchRoom = async (e) => {
    e.preventDefault();
    const url = "https://hagnout-backend.onrender.com/rooms/search-room";
    await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setMessage(data.message);
        } else {
          const room = rooms.find((r) => r.roomName === roomName);
          if (room) {
            setJoinText("Joined");
          } else {
            setJoinText("Join");
          }
          setSearchedRooms(data);
        }
      });
  };

  // Join room function. When user clicks join then this func is called
  const joinRoomHandler = async (roomId) => {
    const url = "https://hagnout-backend.onrender.com/rooms/join-room";
    await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: roomId,
        username: username,
        userId: cookies.get("senderId"),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        window.location.reload();
        setJoinText("Joined");
      });
  };

  const goToChatRoom = (roomid, roomName) => {
    navigate(`room/${roomName}/${roomid}`);
    setGifForCurrentRoom(roomid);
  };

  const userLogoutHnadler = async (e) => {
    e.preventDefault();
    const url = "https://hagnout-backend.onrender.com/users/logout";
    const response = await fetch(url);
    const data = response.json();
    cookies.set("TOKEN", data.token, { path: "/" });
    cookies.set("username", "", { path: "/" });
    cookies.set("senderId", "", { path: "/" });
    cookies.set("profilePic", "", { path: "/" });
    navigate("/");
  };

  const getGifForCurrentRoom = async () => {
    const response = await fetch(
      "https://api.giphy.com/v1/gifs/random?api_key=Khgc864KVLcr2vHOfKWbnBqdpuMAmue6&tag=anime&rating=g"
    );
    const data = await response.json();
    return data;
  };

  const setGifForCurrentRoom = (roomid) => {
    getGifForCurrentRoom().then((gifData) => {
      setGIF(gifData.data.images.original.url);
      setActiveRoomId(roomid);
    });
  };

  return (
    <div className="rooms-container h-screen flex flex-col">
      {/* Top Section */}
      <div className="h-16 w-full my-auto flex items-center justify-center flex-shrink-0 ">
        <form
          method="post"
          className="search--room p-2 w-full"
          onSubmit={handleSearchRoom}
        >
          <input
            type="text"
            placeholder="Room name + Enter"
            value={roomName}
            onChange={handleChangeRoomName}
            className="px-3"
          />
        </form>
      </div>

      {/* Scrollable Middle Section */}
      <div className="flex-grow overflow-y-auto ">
        {searchedRooms.length > 0 ? (
          searchedRooms.map((room, index) => (
            <div
              key={index}
              className="w-full"
              onClick={() => goToChatRoom(room._id, room.roomName)}
            >
              <div className="join--room flex justify-between m-2 p-2 bg-[#222325]">
                <div className="room px-1 my-auto">{room.roomName}</div>
                <button
                  className="join--button py-1 px-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    joinRoomHandler(room.roomId);
                  }}
                >
                  {joinText}
                </button>
              </div>
            </div>
          ))
        ) : message ? (
          <div className="message m-2 p-3">{message}</div>
        ) : (
          // Render the rooms component
          rooms.map((room, index) => (
            <div
              key={index}
              className="room-container"
              onClick={() => goToChatRoom(room._id, room.roomName)}
            >
              <div
                className="room m-2 p-3 cursor-pointer"
                style={
                  activeRoomId === room._id
                    ? {
                        backgroundImage: `url(${gif})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        color: "black",
                        fontWeight: 700,
                        fontSize: "18px",
                      }
                    : {}
                }
              >
                {room.roomName}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Section */}
      <div className="h-12 flex flex-shrink-0 px-2 bg-[#2e3333]">
        <div className="profile--username px-1 flex  items-center">
          <div className="profile w-9 h-9 bg-blue-600 rounded-full">
            <img
              src={profilePic}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="username px-2 font-normal text-[15px]">
            <span>{username}</span>
          </div>
        </div>

        <div className="add--room--settings flex items-center">
          <div className="microphone-status px-1">
            {isMute ? (
              <BiSolidMicrophone
                className="text-3xl "
                onClick={() => toggleMicrophone()}
              />
            ) : (
              <BiSolidMicrophoneOff
                className="text-3xl"
                onClick={() => toggleMicrophone()}
              />
            )}
          </div>
          <div className="add--room px-1 cursor-pointer">
            <IoIosAddCircleOutline
              className="text-3xl"
              onClick={() => setShowCreateRoomModal(true)}
            />
            {showCreateRoomModal &&
              createPortal(
                <CreateRoom onClose={() => setShowCreateRoomModal(false)} />,
                document.body
              )}
          </div>
          <div className="settings px-1 cursor-pointer">
            <CiSettings className="text-3xl text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
