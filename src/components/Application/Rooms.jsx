import React, { useState, useEffect } from "react";
import { TbSettings } from "react-icons/tb";
import { VscDiffAdded, VscSettings } from "react-icons/vsc";
import { IoIosAdd } from "react-icons/io";
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
	const [message, setMessage] = useState('');
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

		const url =  'https://hagnout-backend.onrender.com/rooms/fetch-rooms/';

		const response = fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify({username}),
		})

		response.then((response) => response.json())
			.then((data) => {
				setRooms(data);
				setFetchComplete(true);
			});

	}, [username])



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
				if(data.message) {
					setMessage(data.message);
				}else {
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

  return (
    <div className="rooms-container grid grid-rows-12">
      <div className="search--room row-span-1 my-auto">
        <form
          method="post"
          className="search--room p-2"
          onSubmit={handleSearchRoom}
        >
          <input
            type="text"
            placeholder="Type room name and hit enter"
            value={roomName}
            onChange={handleChangeRoomName}
            className="px-3"
          />
        </form>
      </div>

      <div className="rooms row-span-10">
{(searchedRooms.length > 0 ) ? (
        // Render nothing or some other component if searchedRooms or message is present


	  searchedRooms.map((room, index) => (
            <div
              key={index}
              className=""
              onClick={() => goToChatRoom(room._id, room.roomName)}
            >
              <div className="join--room flex justify-between m-2 p-2">
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
      )  : message ? (
        // Render the message
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


      <div className="flex justify-between p-2">
        <div className="username flex py px-1">
	<div className=" mt-0 lg:mt-2 profile--picture  h-12 w-12 mr-3 text-white text-2xl flex items-center justify-center">
            <img
              src={profilePic}
              alt="avatar"
className="w-full h-full object-cover"
            />
          </div>
          <div className="username my-auto">{username}</div>
        </div>

        <div className="add--settings flex p-4 px-1">
          <div className="add--room my-auto">
            <VscDiffAdded
              className="add mx-2 cursor-pointer text-3xl"
              onClick={() => setShowCreateRoomModal(true)}
            />
            {showCreateRoomModal &&
              createPortal(
                <CreateRoom onClose={() => setShowCreateRoomModal(false)} />,
                document.body
              )}
          </div>

          <VscSettings className="settings mx-2 cursor-pointer my-auto text-3xl" onClick={togglePopup}/>

		{isSettingPopupVisible && (
            <div className="popup-menu absolute md:bottom-20 md:left-4 2xl:left-28 2xl:bottom-16 w-48 text-white">
              <ul>
                <li className="px-4 py-2 bg-red-800 hover:bg-red-700 cursor-pointer">Sign Out</li>
                <li className="px-4 py-2 hover:bg-green-700 cursor-pointer">Settings</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms;







		// socket.on("msg", (msgC) => {
		// 	console.log('Received message from socket:', msgC);
		// 	setSocketMessages((prevMessages) => [...prevMessages, msgC]);
		// });

