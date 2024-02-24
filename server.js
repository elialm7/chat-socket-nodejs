const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/utils.js');
const {userJoin, getCurrentUser, userLeaves, getRoomUsers} = require('./utils/users.js');

const app = express();
const PORT = 3000 || process.env.PORT;


const server = http.createServer(app);
const io = socketio(server);

const botname= 'ChatBot';

//sets the static frontend as the static for the js server 
app.use(express.static(path.join(__dirname, 'public')));

//run when the client connects 

io.on('connection', socket => {

	socket.on('joinRoom', ({username, room})=>{
		
		let user = userJoin(socket.id, username, room);
		socket.join(user.room);
		
		socket.emit('message',formatMessage(botname, 'Welcome to ChatChord.'));
		
		socket.broadcast.to(user.room).emit('message', formatMessage(botname, ` ${user.username} has joined the chat.`));
		
		// send users and room 
		
		io.to(user.room).emit('roomUsers', {
			room: user.room, 
			users: getRoomUsers(user.room)
		});
		
	});
	

	
	// listen for chatMessage
	
	socket.on('chatMessage', (msg)=>{
		let user = getCurrentUser(socket.id);
		console.log(`${user.username} : ${msg}`);
		io.to(user.room).emit('message', formatMessage(user.username, msg));
	});
		
	//runs when cliente disconnects 
	
	socket.on('disconnect', ()=>{
		let user = getCurrentUser(socket.id);
		userLeaves(socket.id);
		if(user){
			io.to(user.room).emit('message', formatMessage(botname, `${user.username} has left the chat.`));
			io.to(user.room).emit('roomUsers', {
				room: user.room, 
				users: getRoomUsers(user.room)
			});
		}
		
	});
});

server.listen(PORT, () => {
    console.log("server running");
});
