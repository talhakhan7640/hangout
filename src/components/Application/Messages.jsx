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

  const lastUser = messageContainer[messageContainer.length - 1];
  
  const getRandomColor = (index) => {
    const colors = [
    "#F87171", // red
    "#60A5FA", // blue
    "#34D399", // green
    "#FBBF24", // yellow
    "#A78BFA", // purple
    "#FF79C6", // pink (VSCode-inspired)
    "#8BE9FD", // cyan (VSCode-inspired)
    "#BD93F9", // light purple (Discord-inspired)
    "#FFB86C", // orange (Discord-inspired)
    "#50FA7B", // bright green (Discord-inspired)
    "#FF5555", // bold red (Discord-inspired)
    "#6272A4", // VSCode dark blue
    "#FFFA65", // bright yellow
    "#8A8AFF", // indigo
    "#6EE7B7", // teal green
    "#B0E57C", // light lime green
    "#E879F9", // fuchsia
  ];
    return colors[index % colors.length];
  };

  return (
    <div className="message--container">
      {messageContainer.map((msg, idx) => {
        const isNewSender =
          idx === 0 || messageContainer[idx - 1].username !== msg.username;

        return (
          <div className="message-container mb-1 mt-1 px-3 md:px-4" key={idx}>
            <div className="profile--username flex items-start">
              {isNewSender && (
                <div className="mt-2 profile--picture rounded-full overflow-hidden h-10 w-10 mr-3 bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                  <img
                    src={msg.profilePic}
                    alt="avatar"
                    className="w-full h-full object-cover user--profile--picture"
                  />
                </div>
              )}
              <div className="my-auto ">
                {isNewSender && (
                  <div className="user-username pl-1 my-auto mt-1 flex">
                    <span className="font-normal username-msg" style={{
                      color : getRandomColor(Math.floor(Math.random() * 17))
                    }}>
                      {msg.username}
                    </span>
                    <span className="ml-4 text-sm my-auto timestamp">
                      {moment(msg.timestamp).format("MMMM Do YYYY, h:mm a")}
                    </span>
                  </div>
                )}
                {msg.fileUrl && (
                  <div className={`file ${isNewSender ? "pl-1" : "pl-14"}` }>
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={msg.fileUrl}
                        className={`mt-1 mb-1 rounded-lg w-full sm:w-96 md:w-1/2 lg:w-2/3 xl:w-2/6 object-cover`}
                        style={{
                        }}
                        alt="file"
                      />
                    </a>
                  </div>
                )}

                <div className={`message ${isNewSender ? "pl-1" : "pl-14"}`}>
                  {linkify(msg.messageContent)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
