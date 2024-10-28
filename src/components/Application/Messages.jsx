import React, { useState, useEffect } from "react";
import "../../assets/styles/Messages.css";
import socket from "../socket/socket";
import moment from "moment";

const Messages = ({ roomid }) => {
  const [messageContainer, setMessageContainer] = useState([]);
  const [loading, setLoading] = useState(true);

  const url = `https://hagnout-backend.onrender.com/messages/${roomid}`;

  useEffect(() => {
    const controller = new AbortController();

    const fetchMessages = async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();
        setMessageContainer(data);
        setLoading(false);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
    socket.on("msg", (msgC) => {
      console.log(msgC);
      setMessageContainer((prevMessages) => [...prevMessages, msgC]);
    });

    return () => {
      controller.abort();
      socket.off("msg");
    };
  }, [url]);

  if (loading) {
    return <div>Loading messages...</div>;
  }

  const linkify = (text) => {
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          style={{ color: "#1E9DE9", fontStyle: "italic" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  return (
    <div className="message--container">
      {messageContainer.map((msg, idx) => (
        <div className="message-container mb-2 mr-4" key={idx}>
          <div className="profile--username flex">
            <div className="mt-2 profile--picture h-9 w-9 mr-3 text-white flex items-center justify-center">
              <img src={msg.profilePic} alt="avatar" className="pic" />
            </div>
            <div className="my-auto">
              <div className="user-username my-auto mt-1 flex">
                <span className="font-semibold username-msg">{msg.username}</span>
                <span className="ml-4 text-sm my-auto timestamp">
                  {moment(msg.timestamp).format("MMMM Do YYYY, h:mm a")}
                </span>
              </div>
              {msg.fileUrl && (
                <div className="file">
                  <img src={msg.fileUrl} className="mt-3" alt="file" />
                </div>
              )}
              <div className="message ml-auto">
                {linkify(msg.messageContent)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Messages;
