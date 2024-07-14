import { io } from "socket.io-client";

//Create a socket instance 
const socket = io("https://hagnout-backend.onrender.com/", {
	extraHeaders: {
		'my-custom-header' : "abcd",
	}
});

// Handle connection
socket.on('connect', () => {
	console.log(` a user connected with id: `, socket.id);
})

socket.on('disconnect', () => {
	console.log(` a user disconnected with id: `, socket.id);
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
