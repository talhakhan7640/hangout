import { useEffect, useState } from "react";
import "../../assets/styles/MusicPlayer.css";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { storage } from "../../firebase/firebase.config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useParams } from "react-router-dom";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom } from "react-icons/fa"; // Icons from react-icons
import {current} from "@reduxjs/toolkit";


const MusicPlayer = () => {
  const { roomid } = useParams();
  const [tracks, setTracks] = useState([]);

  // music controls 
  const [currentTrack, setCurrentTrack] = useState({
    name: '',
    url : '' 
  });
  const [runningTrack, setRunningTrack] = useState('');

  const changeCurrentTrack = (trackName, trackUrl) => {
    setCurrentTrack({name: trackName, url: trackUrl});
  }
   
  //handle audio change
  const handleFileChange = (e) => {
    console.log("i got called");
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      fileUpload(file);
    }
  };

  //handle audio upload
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: roomid,
        trackUrl: fileUrl,
        trackName: fileName,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => console.log(data));
  };


  useEffect(() => {

    const url = `https://hagnout-backend.onrender.com/rooms/fetch-tracks/${roomid}`;

    const fetchTracks = async () => {
      const response = await fetch(url);
      const data = await response.json();
      setTracks(data);
       // Reset current track when roomid changes
        setCurrentTrack({
          name: '',
          url: ''
        });
    }

    fetchTracks();
  }, [roomid])


  
  return (
    <div className="music-player grid grid-rows-12">
       <div className="search--room row-span-1 my-auto">
      <div className="music--player--top--bar p-2 ">
        <div className=" flex">
          <form method="post" className="search--music p-2 w-full">
            <input type="" placeholder="Search music" className="px-3 " />
          </form>

          <div className="my-auto ml-2 upload--song ">
            <label for="file--upload">
              <MdOutlineDriveFolderUpload className="text-3xl mr-2" />
            </label>

            <input
              id="file--upload"
              onChange={handleFileChange}
              type="file"
    className="file--upload--button "
            />
          </div>
        </div>
      </div>
    </div>


   <div className="tracks--list row-span-10">
    {tracks.map((track, index) => (
      <div key={index}>
          <div className="track flex justify-between px-4">
              <span className="track--name">{track.trackName}</span>
      <button onClick={() => changeCurrentTrack(track.trackName, track.trackUrl)}>play</button>
          </div>
      </div>
    ))}
        </div>



    <div className="row-span-1">
        <div className="track--controls">
          <h1>{currentTrack.name}</h1>
          {currentTrack.url? ( 
           <audio controls src={currentTrack.url} />

          ) : ''}
        </div>
    </div>

    
    </div>
  )

};

export default MusicPlayer;
