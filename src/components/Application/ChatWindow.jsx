import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/styles/ChatWindow.css";
import { TbDotsVertical } from "react-icons/tb";
import EmojiPicker from "emoji-picker-react";
import Messages from "./Messages";
import Cookies from "universal-cookie";
import socket from "../socket/socket.js";
import MusicPlayer from "./MusicPlayer";
import { storage } from "../../firebase/firebase.config.js";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { IoPeopleSharp } from "react-icons/io5";
import { TbPinFilled } from "react-icons/tb";
import { RiNeteaseCloudMusicFill } from "react-icons/ri";

const ChatWindow = () => {
  const cookie = new Cookies();
  const { roomid, roomName } = useParams();

  // Message state
  const [messageContent, setMessageContent] = useState("");

  // Toggle emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [membersList, setMembersList] = useState([]);

  //Toggle popup
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  const appendEmoji = (emoji) => {
    let message = messageContent;
    setMessageContent(message + emoji.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // handle uploaded files
  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const uploadFile = async () => {
    if (selectedFile) {
      const folder = selectedFile.type.startsWith("image/")
        ? "images"
        : "videos";
      const storageRef = ref(storage, `${folder}/${selectedFile.name}`);

      await uploadBytes(storageRef, selectedFile);
      const url = await getDownloadURL(storageRef);
      setFileUrl(url);
      return url;
    }
    return null;
  };

  // this function is called on submit
  const handleSubmitMessage = async (e) => {
    e.preventDefault();

    let fileUrlToSend = fileUrl;
    if (selectedFile && !fileUrl) {
      fileUrlToSend = await uploadFile();
    }

    if (messageContent.length > 0 || fileUrlToSend) {
      // make an API call for sending message

      const url = "https://hagnout-backend.onrender.com/messages/send";
      // const url = "http://localhost:5000/messages/send";

      await fetch(url, {
        method: "POST",
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
        // send real time message to the server
        socket.emit("msg", {
          messageContent: messageContent,
          fileUrl: fileUrlToSend,
          username: cookie.get("username"),
        });
        setMessageContent("");
        setSelectedFile(null);
        setFilePreview(null);
        return response.json();
      })
      .then((data) => {
        console.log(data.message);
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: roomid,
        username: cookie.get("username"),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        navigate("/hangout/rooms");
        window.location.reload();
      });
  };

  const getMembersList = async () => {
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
      console.log(setMembersList(data[0].members));
    });
  }

  return (
    <div className="message--container grid grid-cols-12 ">
      <div className=" col-span-12 h-full room--details--container xl:col-span-9 grid grid-rows-12 ">

        <div className="top--bar px-4 h-14 row-span-1 flex justify-between">

          <div className="text-xl font-bold room--name my-auto">
            <span className="tag"># </span>
            {roomName}
          </div>

          <div className="search--message more--options  flex justify-between">
            <TbPinFilled className="my-auto mr-3 text-5xl" style={{"color": "#DBDEE1"}}/>
            <IoPeopleSharp  className="my-auto mr-3 text-5xl" style={{"color": "#DBDEE1"}} onClick={() => getMembersList()}/>
            <input
              type="text"
              className=" my-auto px-2 py-1 mr-3 text-white"
              placeholder="Search message"
              style={{"color": "#DBDEE1" }}
            />

            {isPopupVisible && (
              <div className="popup-menu absolute right-12 mt-2 w-48 text-white">
                <ul>
                  <li
                    className="px-4 py-2 bg-red-800 hover:bg-red-700 cursor-pointer"
                    onClick={handleLeaveRoom}
                  >
                    Leave Room
                  </li>
                  <li className="px-4 py-2 hover:bg-green-700 cursor-pointer">
                    Invite Friend
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
                    Mute Room
                  </li>
                </ul>
              </div>
            )}

            <RiNeteaseCloudMusicFill className="my-auto text-5xl"
              style={{
                "color" : "#DBDEE1"
              }}
            />
            <TbDotsVertical
              className=" text-5xl my-auto more--options "
              onClick={togglePopup}
              style={{"color": "#DBDEE1"}}
            />

          </div>
        </div>

        <div
          className="message--pool -mt-6 row-span-10  overflow-y-auto"
          style={{ maxHeight: "85.5vh" }}
        >
          <Messages roomid={roomid} className="" />
        </div>

        <div className="message--input row-span-1 px-4 relative">
          {filePreview && (
            <div className="file-preview-container absolute left-0 bottom-16 mb-2 ml-4 p-2 rounded flex items-center">
              <img
                src={filePreview}
                alt="File preview"
                className="file-preview-image w-48 h-48 object-cover rounded"
              />
              <button
                onClick={handleRemoveFile}
                className="remove-file-button ml-2 text-white p-1 my-0"
              >
                ✕
              </button>
            </div>
          )}
          <div className="message--field w-full py-4">
            <form action="" onSubmit={handleSubmitMessage}>
              <span className="file-attach-icon absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
                📎
                <input
                  type="file"
                  className="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleFileAttach}
                />
              </span>

              <input
                type="text"
                onChange={handleMessageChange}
                value={messageContent}
                className="w-full pl-12 px-3 py-2 text-white"
                placeholder={`Type your message and hit enter`}
              />
              <span
                className="emoji-picker-icon absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={toggleEmojiPicker}
              >
                😀
              </span>
            </form>
            {showEmojiPicker && (
              <div className="emoji-picker-container absolute right-0 bottom-full mb-2">
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={(e) => appendEmoji(e)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-0 hidden xl:block xl:col-span-3">
        <MusicPlayer />
      </div>
    </div>
  );
};

export default ChatWindow;
