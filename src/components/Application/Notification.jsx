import { useState, useEffect } from "react";

const Notification = ({ message, duration = 10000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), duration);
    }, 10000);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      className={`fixed  right-5 p-4 bg-blue-500 text-white rounded-lg shadow-lg transition-opacity duration-50 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {message}
    </div>
  );
};

export default Notification;

