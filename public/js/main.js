const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-message');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');



//get user name and room 

const {username, room} = Qs.parse(location.search, {
	ignoreQueryPrefix:true,
});
const socket = io();



socket.emit('joinRoom', {username, room});


// Get room and users


socket.on('roomUsers', ({room, users})=>{
	outputRoomName(room);
	outputUsers(users);
})

// we received the message from the server
socket.on('message', message => {
     outputMessage(message);
	 
	 //scroll down
	 
	 chatMessages.scrollTop = chatMessages.scrollHeight;
});


// message submit 
chatform.addEventListener('submit', (event)=>{
	
	event.preventDefault();
	
	const msg = event.target.elements.msg.value; 


	//emiting the message to the server.
	socket.emit('chatMessage', msg);
	
	
	// clear input
	event.target.elements.msg.value = '';
	event.target.elements.msg.focus();
});



//Output the message to DOM


const outputMessage = (message)=>{
	
	const div = document.createElement('div');
	
	div.classList.add('message');
	
	div.innerHTML = `
			<p class="meta"> ${message.username}<span>   ${message.time}</span></p>
			<p class="text">
			   ${message.text}
			</p>
	
	`;
	
	document.querySelector('.chat-messages').appendChild(div);
	
	
}

const outputRoomName = (room) =>{
	roomName.innerText = room;
}

const outputUsers = (users)=>{
	
	
	userList.innerHTML = `
		${users.map(user => `<li>${user.username}<\li>`).join('')}
	
	`;
	
}