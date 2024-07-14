import React, {useState} from 'react';
import '../../assets/styles/CreateRoom.css'
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

const CreateRoom = ({ onClose }) => {
	const cookie = new  Cookies();
	const navigate = useNavigate();
	const [roomDetails,setRoomDetails] = useState({
		roomName: "",
		roomDescription: "",
		roomAdmin: cookie.get("username"),
	});
	const [response, setResponse] = useState('');
	var statusCode= 0;

	const createRoomHandler = async (e) =>{
		e.preventDefault();
		const url = "https://hagnout-backend.onrender.com/rooms/create-room"
		await fetch(url, {
			method: "POST",
			headers:{
				"Content-Type": "application/json",
			},
			body: JSON.stringify(roomDetails)
		}).then((response) => {
			statusCode = response.status
			return response.json();
		}).then((data) => {
			console.log(data)
			setResponse(data.message);
			if(statusCode !== 409){

        window.location.reload()
				setTimeout(onClose, 2000);

			}
		})
	}
	return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-red-500">{response}</h3>
        <h2 className="text-2xl text-white mb-4">Create a Chat Room</h2>
        <form className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-300"
              htmlFor="roomName"
            >
              Room Name
            </label>
            <input
              type="text"
              id="roomName"
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
              value={roomDetails.roomName}
              onChange={(e) =>
                setRoomDetails({ ...roomDetails, roomName: e.target.value })
              }
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-300"
              htmlFor="roomDescription"
            >
              Room Description
            </label>
            <input
              type="text"
              id="roomDescription"
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
              value={roomDetails.roomDescription}
              onChange={(e) =>
                setRoomDetails({
                  ...roomDetails,
                  roomDescription: e.target.value,
                })
              }
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-red-600 text-white rounded-md"
            >
              Close
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 text-white rounded-md"
              onClick={createRoomHandler}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoom;
