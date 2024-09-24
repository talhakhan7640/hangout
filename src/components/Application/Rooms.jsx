import React, { useState, useEffect } from "react";
import { VscDiffAdded, VscSettings } from "react-icons/vsc";
import "../../assets/styles/Rooms.css";
import CreateRoom from "./CreateRoom";
import { createPortal } from "react-dom";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";

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
  const [fetchComplete, setFetchComplete] = useState(false);

  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  // for searching room with name
  const [roomName, setRoomName] = useState("");

  //Toggle setting popup
  const [isSettingPopupVisible, setIsSettingPopupVisible] = useState(false);

  const togglePopup = () => {
    setIsSettingPopupVisible(!isSettingPopupVisible);
  };

  const handleChangeRoomName = (e) => {
    setRoomName(e.target.value);
  };

  // fetch rooms the current user has joined
  useEffect(() => {
    const url = "https://hagnout-backend.onrender.com/rooms/fetch-rooms/";

    const response = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ username }),
    });

    response
      .then((response) => response.json())
      .then((data) => {
        setRooms(data);
        setFetchComplete(true);
      });
  }, [username]);

  // search room
  const handleSearchRoom = async (e) => {
    e.preventDefault();
    const url = "https://hagnout-backend.onrender.com/rooms/search-room";
    await fetch(url, {
      method: "POST",
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


return (
  <div className="rooms-container grid grid-rows-12 w-full overflow-x-auto">
    {/* Search Room */}
    <div className="search--room row-span-1  my-auto">
        <form
          method="post"
          className="search--room p-2"
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

    
    {/* Rooms List */}
    <div className="rooms row-span-10 overflow-x-auto w-full">
      {searchedRooms.length > 0 ? (
        searchedRooms.map((room, index) => (
          <div
            key={index}
            className="w-full"
            onClick={() => goToChatRoom(room._id, room.roomName)}
          >
            <div className="join--room flex justify-between m-2 p-2 border rounded-md">
              <div className="room px-1 my-auto">{room.roomName}</div>
              <button
                className="join--button py-1 px-4 border rounded-md"
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
              <div className="room m-2 p-3 cursor-pointer">{room.roomName}</div>
            </div>
          ))
        )}


            </div>



    {/* User and Settings */}
    <div className="flex justify-between p-2 w-full">
      <div className="username flex items-center">
<div className=" mt-0 lg:mt-0 profile--picture  h-12 w-12 mr-3 text-white text-2xl flex items-center justify-center">
            <img
              src={profilePic}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>

        <div className="username my-auto">{username}</div>
      </div>

      <div className="add--settings flex items-center space-x-4">
        <VscDiffAdded
          className="text-3xl cursor-pointer"
          onClick={() => setShowCreateRoomModal(true)}
        />
        {showCreateRoomModal &&
          createPortal(
            <CreateRoom onClose={() => setShowCreateRoomModal(false)} />,
            document.body
          )}

        <VscSettings
          className="text-3xl cursor-pointer"
          onClick={togglePopup}
        />
        {isSettingPopupVisible && (
          <div className="popup-menu absolute bottom-20 left-12 w-48 text-white bg-gray-800 rounded-md shadow-lg">
            <ul>
              <button
                className="px-4 py-2 bg-red-800 hover:bg-red-700 cursor-pointer w-full text-left"
                onClick={userLogoutHnadler}
              >
                Sign Out
              </button>
              <li className="px-4 py-2 hover:bg-green-700 cursor-pointer">
                Settings
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
);


};

export default Rooms;
