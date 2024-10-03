import { useEffect, useState, useRef } from "react";
import "../../assets/styles/MusicPlayer.css";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { storage } from "../../firebase/firebase.config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";
import { FaPlayCircle, FaPauseCircle } from "react-icons/fa";
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from "react-icons/fa";
import cover from "../../assets/images/pngwing.com.png";


const MusicPlayer = () => {
  const { roomid } = useParams();
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState({ name: "", url: "" });
  const [runningTrack, setRunningTrack] = useState({ name: "", url: "" });

  const changeCurrentTrack = (trackName, trackUrl) => {
    socket.emit("msg", { trackName, trackUrl });
    setCurrentTrack({ name: trackName, url: trackUrl });
    setRunningTrack({ name: trackName, url: trackUrl });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      fileUpload(file);
    }
  };

  const fileUpload = async (file) => {
    const storageRef = ref(storage, `music/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    addTrackToRoomPlayer(url, file.name);
  };

  const addTrackToRoomPlayer = async (fileUrl, fileName) => {
    const url = "https://hagnout-backend.onrender.com/rooms/add-track";
    await fetch(url, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: roomid, trackUrl: fileUrl, trackName: fileName }),
    })
      .then((response) => response.json())
      .then((data) => {
        window.location.reload();
      });
  };

  useEffect(() => {
    const url = `https://hagnout-backend.onrender.com/rooms/fetch-tracks/${roomid}`;
    const fetchTracks = async () => {
      const response = await fetch(url);
      const data = await response.json();
      setTracks(data);
      setCurrentTrack({ name: "", url: "" });
    };
    fetchTracks();

    socket.on("trackDetails", (msgC) => {
      setCurrentTrack({ name: msgC.trackName, url: msgC.trackUrl });
      setRunningTrack({ name: msgC.trackName, url: msgC.trackUrl });
    });
  }, [roomid]);

  
  // goes here

  return (
  <div className="music-player grid grid-rows-12 h-full">
    <div className="search--room row-span-1 my-auto">
      <div className="music--player--top--bar p-2">
        <div className="flex">
          <form method="post" className="search--music p-2 w-full">
            <input type="text" placeholder="Search music" className="px-3" />
          </form>
          <div className="my-auto ml-2 upload--song">
            <label htmlFor="file--upload">
              <MdOutlineDriveFolderUpload className="text-3xl mr-2" />
            </label>
            <input
              id="file--upload"
              onChange={handleFileChange}
              type="file"
              className="file--upload--button"
            />
          </div>
        </div>
      </div>
    </div>

    <div className="tracks--list row-span-10 " tyle={{maxHeight: '83vh'}}> {/* Added overflow-auto to prevent content overflow */}
      {tracks.map((track, index) => (
        <div key={index}>
          <div className="track flex justify-between items-center px-4 py-2">
                        <span className="track--name flex-grow font-medium text-normal">
              {track.trackName}
            </span>
            <button
              onClick={() => changeCurrentTrack(track.trackName, track.trackUrl)}
              className="ml-4 text-2xl text-gray-600 hover:text-white focus:outline-none"
            >
              {runningTrack.name === track.trackName ? <FaPauseCircle /> : <FaPlayCircle />}
            </button>
          </div>
        </div>
      ))}
    </div>

    <div className="row-span-1 ">
     <span>{currentTrack.name}</span>
    <audio src={currentTrack.url} autoPlay controls/>
    </div>
  </div>
);


  };


export default MusicPlayer;
