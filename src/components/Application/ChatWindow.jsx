import React, { useEffect, useState } from "react";
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
import { AiOutlineSearch } from "react-icons/ai";

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
  const [isMembersListVisible, setIsMembersListVisible] = useState(false);
  const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState(false);

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

  const showMembersList = () => {
    setIsMembersListVisible(!isMembersListVisible);
    setIsMusicPlayerVisible(false);
  };

  const showMusicPlayer = () => {
    setIsMusicPlayerVisible(!isMusicPlayerVisible);
    setIsMembersListVisible(false);
  };

  useEffect(() => {
    const getMembersList = async () => {
      const url = "https://hagnout-backend.onrender.com/rooms/fetch-members";
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomid }),
      })
        .then((response) => response.json())
        .then((data) => {
          setMembersList(data);
        });
    };

    getMembersList();
  }, [roomName]);


return (
  <div className="message--container grid grid-cols-12">
    <div className="col-span-12 xl:col-span-9 h-screen flex flex-col">
      {/* Top Section */}
      <div className="md:h-14 flex py-2 items-center px-3 md:px-4 justify-between top--bar flex-shrink-0">
        {/* Room Name on Left */}
        <div className="text-xl font-bold room--name">
          <span className="tag"># </span>
          {roomName}
        </div>

        {/* Icons on Right */}
        <div className="search--message more--options flex items-center space-x-3">
          {/* Icons for Larger Screens */}
          <TbPinFilled
            className="my-auto text-5xl hidden md:block"
            style={{ color: "#DBDEE1" }}
          />
          <IoPeopleSharp
            className="my-auto text-5xl hidden md:block"
            style={{ color: "#DBDEE1" }}
            onClick={() => showMembersList()}
          />

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
            onClick={() => showMusicPlayer()}
          />
          <TbDotsVertical
            className="text-2xl md:text-5xl my-auto more--options"
            onClick={togglePopup}
            style={{ color: "#DBDEE1" }}
          />
        </div>
      </div>

      {/* Scrollable Middle Section */}
      <div className="flex-grow overflow-y-auto relative">
        <div className="absolute right-6 md:right-7 top-0 flex flex-col space-y-4">
          {isMembersListVisible && (
            <div
              className="room--members--list p-4 rounded-md"
              style={{
                width: "200px",
                backgroundColor: "#19191B",
              }}
            >
              {membersList.map((member, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <div className="profile--picture rounded-full overflow-hidden h-10 w-10 mr-3 bg-blue-500 text-white flex items-center justify-center">
                    <img
                      src={member.profilePic}
                      alt="avatar"
                      className="w-full h-full object-cover user--profile--picture"
                    />
                  </div>
                  <span className="member--name text-white">
                    {member.username}
                  </span>
                </div>
              ))}
            </div>
          )}

          {isMusicPlayerVisible && (
            <div className="music-player bg-gray-800  rounded-md shadow-md text-white">
              <MusicPlayer />
            </div>
          )}
        </div>

        {/* Messages Section */}
        <Messages roomid={roomid} />
      </div>

      {/* Bottom Section */}
      <div className="message--input relative h-18 py-4 flex items-center justify-center">
        {/* File Preview (Conditional) */}
        {filePreview && (
          <div className="file-preview-container absolute bottom-20 left-4 mb-2 p-2 rounded flex items-center bg-gray-800 border border-gray-700">
            <img
              src={filePreview}
              alt="File preview"
              className="file-preview-image w-32 h-32 object-cover rounded"
            />
            <button
              onClick={handleRemoveFile}
              className="remove-file-button ml-2 text-white p-1 bg-red-500 rounded-full"
            >
              ✕
            </button>
          </div>
        )}

        {/* Message Field */}
        <div className="message--field w-full px-4 text-white flex items-center relative">
          <form
            action=""
            onSubmit={handleSubmitMessage}
            className="w-full flex items-center space-x-3"
          >
            {/* File Attach Icon */}
            <label className="file-attach-icon cursor-pointer relative">
              📎
              <input
                type="file"
                className="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full"
                onChange={handleFileAttach}
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

            {/* Emoji Picker Icon */}
            <span
              className="emoji-picker-icon cursor-pointer"
              onClick={toggleEmojiPicker}
            >
              😀
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
    <div className="hidden xl:block xl:col-span-3">
      <MusicPlayer />
    </div>
  </div>
);


  // return (
  //   <div className="message--container grid grid-cols-12 ">
  //     <div className="col-span-12 xl:col-span-9 h-screen flex flex-col">
  //       {/* Top Section */}
  //       <div className=" md:h-14 flex py-2 items-center px-3 md:px-4 justify-between top--bar flex-shrink-0">
  //         {/* Room Name on Left */}
  //         <div className="text-xl font-bold room--name">
  //           <span className="tag"># </span>
  //           {roomName}
  //         </div>

  //         {/* Icons on Right */}
  //         <div className="search--message more--options flex items-center space-x-3">
  //           {/* Search Icon for Mobile, Search Input for Larger Screens */}
  //           {/* Icons that only appear on larger screens */}
  //           <TbPinFilled
  //             className="my-auto text-5xl hidden md:block"
  //             style={{ color: "#DBDEE1" }}
  //           />
  //           <IoPeopleSharp
  //             className="my-auto text-5xl hidden md:block"
  //             style={{ color: "#DBDEE1" }}
  //             onClick={() => showMembersList()}
  //           />

  //           <div className="block md:hidden">
  //             <AiOutlineSearch className="text-2xl" />
  //           </div>
  //           <input
  //             type="text"
  //             className="hidden md:block my-auto px-2 py-1 text-white"
  //             placeholder="Search message"
  //             style={{ color: "#DBDEE1" }}
  //           />

  //           {/* Music and Menu Icons, Always Visible */}
  //           <RiNeteaseCloudMusicFill
  //             className="my-auto text-2xl md:text-5xl"
  //             style={{ color: "#DBDEE1" }}
  //             onClick={() => showMusicPlayer()}
  //           />
  //           <TbDotsVertical
  //             className="pr-0 text-2xl md:text-5xl my-auto more--options"
  //             onClick={togglePopup}
  //             style={{ color: "#DBDEE1" }}
  //           />
  //         </div>
  //       </div>

  //       {/* Scrollable Middle Section */}
  //       <div className="flex-grow overflow-y-auto">
  //         <div className="absolute right-8  flex flex-col items-end space-y-4">
  //           {isMembersListVisible && (
  //             <div
  //               className="room--members--list p-4"
  //               style={{
  //                 height: "",
  //                 width: "200px",
  //                 backgroundColor: "#19191B",
  //               }}
  //             >
  //               {membersList.map((member, idx) => (
  //                 <div className="flex">
  //                   <div className=" mt-2 mb-2 profile--picture rounded-full overflow-hidden h-10 w-10 mr-3 bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
  //                     <img
  //                       src={member.profilePic}
  //                       alt="avatar"
  //                       className="w-full h-full object-cover user--profile--picture"
  //                     />
  //                   </div>

  //                   <span className="member--name my-auto">
  //                     {member.username}
  //                   </span>
  //                 </div>
  //               ))}
  //             </div>
  //           )}
  //         </div>

  //         {isMusicPlayerVisible && (
  //           <div className="absolute right-0">Music Player</div>
  //         )}

  //         <Messages roomid={roomid} className="" />
  //       </div>

  //       {/* Bottom Section */}
  //       <div className="message--input relative h-18 py-4 flex items-center justify-center">
  //         {/* File Preview (Conditional) */}
  //         {filePreview && (
  //           <div className="file-preview-container absolute bottom-20 left-4 mb-2 p-2 rounded flex items-center bg-gray-800 border border-gray-700">
  //             <img
  //               src={filePreview}
  //               alt="File preview"
  //               className="file-preview-image w-32 h-32 object-cover rounded"
  //             />
  //             <button
  //               onClick={handleRemoveFile}
  //               className="remove-file-button ml-2 text-white p-1 bg-red-500 rounded-full"
  //             >
  //               ✕
  //             </button>
  //           </div>
  //         )}

  //         {/* Message Field */}
  //         <div className="message--field  w-full px-4  text-white flex items-center relative">
  //           <form
  //             action=""
  //             onSubmit={handleSubmitMessage}
  //             className="w-full flex items-center space-x-3"
  //           >
  //             {/* File Attach Icon */}
  //             <label className="file-attach-icon cursor-pointer relative">
  //               📎
  //               <input
  //                 type="file"
  //                 className="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full"
  //                 onChange={handleFileAttach}
  //               />
  //             </label>

  //             {/* Message Input */}
  //             <input
  //               type="text"
  //               onChange={handleMessageChange}
  //               value={messageContent}
  //               className="w-full px-3 py-2 text-white rounded-lg placeholder-gray-400"
  //               placeholder="Type your message and hit enter"
  //             />

  //             {/* Emoji Picker Icon */}
  //             <span
  //               className="emoji-picker-icon cursor-pointer"
  //               onClick={toggleEmojiPicker}
  //             >
  //               😀
  //             </span>

  //             {/* Emoji Picker Dropdown */}
  //             {showEmojiPicker && (
  //               <div className="emoji-picker-container absolute bottom-full right-0 ">
  //                 <EmojiPicker
  //                   theme="dark"
  //                   onEmojiClick={(e) => appendEmoji(e)}
  //                 />
  //               </div>
  //             )}
  //           </form>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="hidden xl:block xl:col-span-3">
  //       <MusicPlayer />
  //     </div>
  //   </div>
  // );
};

export default ChatWindow;
