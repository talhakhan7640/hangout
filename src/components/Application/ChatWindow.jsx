import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/styles/ChatWindow.css";
import { TbDotsVertical } from "react-icons/tb";
import EmojiPicker from "emoji-picker-react";
import Messages from "./Messages";
import Cookies from "universal-cookie";
import socket from "../socket/socket.js";
import MusicPlayer from "./MusicPlayer";
import { IoPeopleSharp } from "react-icons/io5";
import { TbPinFilled } from "react-icons/tb";
import { RiNeteaseCloudMusicFill } from "react-icons/ri";
import { AiOutlineSearch } from "react-icons/ai";
import { BiImageAdd } from "react-icons/bi";
import { BsEmojiWink } from "react-icons/bs";
import { PiGifFill } from "react-icons/pi";
import { LuSticker } from "react-icons/lu";

// Notification component
import Notification from "./Notification";


import MP from "./MP";

// modules for uploading files on the firestore
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const ChatWindow = () => {
  const cookie = new Cookies();
  const { roomid, roomName } = useParams();

  // file state
  const [fileToSend, setFileToSend] = useState(null);

  // Message state
  const [messageContent, setMessageContent] = useState("");

  // Toggle emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  //Toggle popup
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Toggle Image preview container
  const [previewContainer, setPreviewContainer] = useState(false);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  // HANDLE EMOJI PICKER
  const appendEmoji = (emoji) => {
    let message = messageContent;
    setMessageContent(message + emoji.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  // handle file change function
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileToSend(file);
    setPreviewContainer(true);
  };

  const handleImagePreview = () => {
    setPreviewContainer(!previewContainer);
    setFileToSend(null);
  };

  const uploadFileToFirestore = async () => {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `images/${fileToSend.name}`);
      uploadBytes(storageRef, fileToSend);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error uploading file to Firestore:", error);
      throw error;
    }
  };

  // This function is called on submit
  const handleSubmitMessage = async () => {
    let fileUrlToSend = "";
    if (fileToSend) {
      fileUrlToSend = await uploadFileToFirestore();
    }

    if (messageContent.length > 0 || fileUrlToSend) {
      const url = "https://hagnout-backend.onrender.com/messages/send";
       //const url = "http://localhost:5000/messages/send";

      await fetch(url, {
        method: "POST",
        credentials : "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageContent: messageContent,
          fileUrl: fileUrlToSend,
          senderId: cookie.get("senderId"),
          roomId: roomid,
        }),
      })
        .then((response) => {
        socket.emit("send-message", { roomId : roomid, message: {
          messageContent: messageContent,
          fileUrl: fileUrlToSend
        }, username : cookie.get("username") });
        return response.json();
        })
        .then((data) => {
          setFileToSend(null);
          setMessageContent("");
          setPreviewContainer(false);
        });
    }
  };

  const handleMessageChange = (e) => {
    e.preventDefault();
    setMessageContent(e.target.value);
  };

  const navigate = useNavigate();
  const handleLeaveRoom = () => {
    const url = "https://hagnout-backend.onrender.com/rooms/leave-room/";

    fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: roomid,
        username: cookie.get("username"),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        navigate("/hangout/rooms");
        window.location.reload();
      });
  };

  const [newUserMessage, setNewUserMessage] = useState("");
  const [messageKey, setMessageKey] = useState(0);

  useEffect(() => {
    socket.emit("join_room", { roomId: roomid, username: cookie.get("username") });
    socket.on("greetings", (data) => console.log(data));
    return () => {
      socket.emit("leave-room", { roomId: roomid, username: cookie.get("username") });
      socket.off("running_track");
    };
  }, [roomid]);

  return (
    <div className="message--container grid grid-cols-12">
      <div className="col-span-12 xl:col-span-9 h-screen flex flex-col">
        <Notification message={newUserMessage} key={messageKey} />
        {/* Top Section */}
        <div className="md:h-14 flex py-2 items-center px-3 md:px-4 justify-between top--bar flex-shrink-0 border-b-2 border-[#19191b]">
          {/* Room Name on Left */}
          <div className="text-xl font-bold room--name">
            <span className="tag">#</span>
            {roomName}
          </div>

          {/* Icons on Right */}
          <div className="search--message more--options flex items-center space-x-3">
            {/* Icons for Larger Screens */}

            {/* Search Icon for Mobile */}
            <div className="block md:hidden">
              <AiOutlineSearch className="text-2xl" />
            </div>
            <input
              type="text"
              className="hidden md:block my-auto px-2 py-1 text-white "
              placeholder="Search message"
              style={{ color: "#DBDEE1" }}
            />

            {/* Music and Menu Icons */}
            <RiNeteaseCloudMusicFill
              className="my-auto text-2xl md:text-5xl  xl:hidden"
              style={{ color: "#DBDEE1" }}
            />

            <TbDotsVertical
              className="text-2xl md:text-4xl my-auto more--options"
              onClick={togglePopup}
              style={{ color: "#DBDEE1" }}
            />
          </div>
        </div>

        {/* Scrollable Middle Section */}
        <div className="flex-grow overflow-y-auto relative">
          <div className="absolute right-6 md:right-7 top-0 flex flex-col space-y-4"></div>

          {/* Messages Section */}
          <Messages roomid={roomid} />
        </div>

        {/* Bottom Section */}
        <div className="message--input relative h-18 py-4 flex items-center justify-center">
          {/* Image preview container*/}
          {previewContainer && fileToSend ? (
            <div
              className="preview absolute flex bottom-16 left-0 m-4 bg-[#19191B]"
              onSubmit={handleMessageChange}
              style={{
                width: "300px",
                backgroundColor: "#19191B",
              }}
            >
              <img
                src={URL.createObjectURL(fileToSend)}
                className="h-full"
                alt="image-preview"
              />
              <div
                className="ml-2 mt-1 text-lg cursor-pointer"
                onClick={handleImagePreview}
              >
                <span className="bg-red-900 p-1">X</span>
                
              </div>
            </div>
          ) : (
            ""
          )}

          {/* Message Field */}
          <div
            className="message--field w-full px-4 text-white flex items-center relative"
            onKeyDown={(e) => {
              if (e.key === "Enter" && previewContainer) {
                e.preventDefault();
                handleSubmitMessage();
              }
            }}
          >
            <form
              action=""
              onSubmit={(e) => {
                e.preventDefault(); // Prevent default form submission
                handleSubmitMessage(); // Call your submit function
              }}
              className="w-full flex items-center space-x-3"
            >
              {/* File Attach Icon */}
              <label className="file-attach-icon cursor-pointer relative">
                <BiImageAdd className="text-3xl" style={{ color: "#DBDEE1" }} />
                <input
                  type="file"
                  className="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleFileChange}
                />
              </label>

              {/* Message Input */}
              <input
                type="text"
                onChange={handleMessageChange}
                value={messageContent}
                className="w-full px-3 py-2 text-white placeholder-gray-400"
                placeholder="Type your message and hit enter"
              />

              <span className="sticker-picker-icon cursor-pointer">
                <LuSticker className="text-3xl" style={{ color: "#DBDEE1" }} />
              </span>

              <span className="gif-picker-icon cursor-pointer">
                <PiGifFill className="text-3xl" style={{ color: "#DBDEE1" }} />
              </span>

              {/* Emoji Picker Icon */}

              <span
                className="emoji-picker-icon cursor-pointer"
                onClick={toggleEmojiPicker}
              >
                <BsEmojiWink
                  className="text-2xl"
                  style={{ color: "#DBDEE1" }}
                />
              </span>

              {/* Emoji Picker Dropdown */}
              {showEmojiPicker && (
                <div className="emoji-picker-container absolute bottom-full right-0 mb-2">
                  <EmojiPicker
                    theme="dark"
                    onEmojiClick={(e) => appendEmoji(e)}
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Visible on Large Screens */}

      {
      <div className="hidden xl:block xl:col-span-3">
          {/*   <MusicPlayer /> */}
          <MP />
        
      </div>
}
    </div>
  );
};

export default ChatWindow;
