import { io } from "socket.io-client";

// local socket instance
const localSocket = "http://localhost:5000";

// live socket instance
const liveSocket = "https://hagnout-backend.onrender.com/"

//Create a socket instance 
const socket = io(liveSocket, {
	autoConnect: true,
	extraHeaders: {
		'my-custom-header' : "abcd",
	}
});

// Handle connection
socket.on('connect', () => {
	console.log(`a user connected with id: `, socket.id);
})

socket.on('disconnect', () => {
	console.log(`a user disconnected with id: `, socket.id);
})

socket.on('connect_error',(error) => {
	if(socket.active){
		console.log("trying to reconnect");
	}else {
		console.log("internel server error");
		console.log(error.message);
	}
})

export default socket;
