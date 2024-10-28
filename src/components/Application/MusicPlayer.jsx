import { useEffect, useState, useRef } from "react";
import "../../assets/styles/MusicPlayer.css";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { storage } from "../../firebase/firebase.config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";
import { FaPlay, FaPause, FaStepBackward, FaStepForward} from "react-icons/fa";
import { GoArrowDown } from "react-icons/go";


const MusicPlayer = () => {
  const { roomid } = useParams();
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState({ name: "", url: "" });
  const [runningTrack, setRunningTrack] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [fullDuration, setFullDuration] = useState(0);
  const audioRef = useRef();
  
  const changeCurrentTrack = (trackName, trackUrl) => {
    socket.emit("msg", { trackName, trackUrl });
    setCurrentTrack({ name: trackName, url: trackUrl });
    setIsPlaying(true);
    setRunningTrack(trackName);
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

  // Tracks controllers
  const playTrack = () => {
    audioRef.current.play();
    setIsPlaying(true);
  }

  const pauseTrack = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  }
  
  const playNextTrack = () => {
    const cTrackName = currentTrack.name;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].trackName === cTrackName) {
        // Check if there is a next track
        if (i + 1 < tracks.length) {
          changeCurrentTrack(tracks[i + 1].trackName, tracks[i + 1].trackUrl);
        } else {
          // Optional: Go back to the first track or do nothing if at the end of the list
          changeCurrentTrack(tracks[0].trackName, tracks[0].trackUrl);
        }
        break; // Exit the loop once the next track is found
      }
    }
  }

  const playPreviousTrack = () => {
    const cTrackName = currentTrack.name;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].trackName === cTrackName) {
        // Check if there is a next track
        if (i > 0) {
          changeCurrentTrack(tracks[i - 1].trackName, tracks[i - 1].trackUrl);
        } else {
          // Optional: Go back to the first track or do nothing if at the end of the list
          changeCurrentTrack(tracks[tracks.length - 1].trackName, tracks[tracks.length - 1].trackUrl);
        }
        break; // Exit the loop once the next track is found
      }
    }
  }

  const getFullLenght = () => {
    setFullDuration(audioRef.current.duration);
  }

  const getCurrentTimeUpdate = () => {
    const time = audioRef.current.currentTime;
    setDuration(time);
  }
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

   const handleSliderChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setDuration(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  useEffect(() => {
    const url = `https://hagnout-backend.onrender.com/rooms/fetch-tracks/${roomid}`;
    const fetchTracks = async () => {
      const response = await fetch(url);
      const data = await response.json();
      setTracks(data);
      setCurrentTrack({ name: "", url: "" });
      setIsPlaying(false);
    };
    fetchTracks();

    socket.on("trackDetails", (msgC) => {
      setCurrentTrack({ name: msgC.trackName, url: msgC.trackUrl });
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

      <div className="tracks--list row-span-9 " tyle={{ maxHeight: "83vh" }}>
        {/* Added overflow-auto to prevent content overflow */}
        {tracks.map((track, index) => (
          <div key={index}>
            <div className="flex justify-between track px-4 my-4">
              <div className="grid grid-cols-12 gap-4">
              <div className="my-auto col-span-1">
                {runningTrack === track.trackName && isPlaying ? (
                   <FaPause className="text-3xl" onClick={pauseTrack}/>
                ): (
                   <FaPlay className="text-xl" onClick={() => changeCurrentTrack(track.trackName, track.trackUrl)}/>
                )}
              </div>
              <div className="control--name col-span-11 flex mx-3 w-full">
                <div className="control">
                  <div className="bg-black w-16 h-16">
                    <img src={`https://loremflickr.com/200/200?random=${Math.floor(Math.random() * (50 - 1 + 1)) + 1}`} w-full h-full alt="cover--image"/>
                  </div>
                  
                </div>
                <div className="name my-auto mx-4">{track.trackName}</div>
              </div>
              </div>
              <div className="downlaod my-auto mr-1">
                <a href={track.trackUrl} download={track.trackName} target="_"><GoArrowDown className="text-xl"/></a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="music--controller p-2 xl:p-4 flex flex-col justify-between row-span-2 ">
        <div className="track--cover--name flex">
          <div className="track--cover h-16 w-16 bg-black my-auto">
            <img src={`https://loremflickr.com/200/200?random=${Math.floor(Math.random() * (50 - 1 + 1)) + 1}`} w-full h-full alt="cover--image"/>
          </div>
            <div className="track--name ml-2 my-auto">{currentTrack.name ? currentTrack.name : "No track selected"}</div>
        </div>
        <div className="music--controls px-4 xl:px-16 justify-around flex">
          <div className="shuffle">1</div>
          <div className="previous">
            <FaStepBackward  className="text-3xl" onClick={playPreviousTrack}/>
          </div>
          <div className="play--pause"> 
            {isPlaying ? (
                <FaPause className="text-3xl" onClick={pauseTrack}/>
            ): (
              <FaPlay className="text-3xl" onClick={playTrack}/>
            )}
            
          </div>
          <div className="next">
            <FaStepForward  className="text-3xl" onClick={playNextTrack}/>
          </div>
          <div className="loop">5</div>
        </div>
        <div className="flex justify-between">
          <span className="current--time">{formatTime(duration)} </span>
          <input
            type="range"
            min="0"
            max={fullDuration}
            value={duration}
            onChange={handleSliderChange}
            className="progress-bar mx-4"
            style={{
              width: '100%', 
              accentColor: '#1DB954' // Green color to match a Spotify-like theme
            }}
        />
          <span className="full-duration">{formatTime(fullDuration)}</span>
          <audio src={currentTrack.url} ref={audioRef} onTimeUpdate={getCurrentTimeUpdate} onLoadedMetadata={getFullLenght}  autoPlay className="hidden"/>
        </div>
      </div>
    </div>
  );

};

export default MusicPlayer;
