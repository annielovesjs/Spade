let socket = io();
let message = document.getElementById("message");
let username = document.getElementById("username");
let chatID = document.getElementById("chatID");
let send_message = document.getElementById("send_message");
let send_username = document.getElementById("send_username");
let chatroom = document.getElementById("chatroom");
let feedback = document.getElementById("feedback");
var modal = document.getElementById("myModal");
var exit = document.getElementById("close_chat");
let create_room = document.getElementById("create_room");
let chatroomTitle = document.getElementById("chatroomTitle");
let card_back = document.getElementById("card_back");
let reenter_room = document.getElementById("reenter_room");
let join_chat_direct = document.getElementById("join_chat_direct");
let joinRoomForm = document.getElementById("joinRoomForm");
let intro = document.getElementsByClassName("intro")[0];
let nameError = document.getElementById("nameError");
let roomNameError = document.getElementById("roomNameError");

username.focus();

document.getElementsByTagName("body")[0].addEventListener("keyup", (e) => {
	if (e.key == "Escape") {
		chatroom.innerHTML = "";
	}
});

//join game redirect
join_chat_direct.addEventListener("click", () => {
	if (username.value) {
		chatID.style.display = "inline-block";
		send_username.style.display = "inline-block";
		joinRoomForm.style.display = "none";
		intro.style.display = "none";
	} else {
		nameError.style.display = "block";
	}
});

//emit a username
send_username.addEventListener("click", () => {
	if (chatID.value) {
		user = username.value;
		socket.emit("change_username", {
			username: username.value,
			gameRoom: chatID.value,
		});
	} else {
		roomNameError.style.display = "block";
	}
});

create_room.addEventListener("click", () => {
	if (username.value) {
		socket.emit("create_room", { username: username.value });
	} else {
		nameError.style.display = "block";
	}
});

//admit to game room
socket.on("successfully_joined", (data) => {
	modal.style.display = "none";
	chatroomTitle.innerHTML = "Room: " + data.gameRoom;
	message.focus();
});

chatID.addEventListener("keyup", (e) => {
	if (e.key === "Enter") {
		// Cancel the default action, if needed
		e.preventDefault();
		// Trigger the button element with a click
		send_username.click();
	}
});

//listen on enter key for username
username.addEventListener("keyup", (e) => {
	if (e.key === "Enter") {
		// Cancel the default action, if needed
		e.preventDefault();
		// Trigger the button element with a click
		create_room.click();
	}
});

//listen on new message
socket.on("new_message", (data) => {
	let text = document.createElement("div");
	text.classList.add("messageText");
	text.innerHTML =
		"<p class='message'>" + data.username + ": " + data.message + "</p>";
	chatroom.appendChild(text);
	chatroom.scrollTop = chatroom.scrollHeight;
});

//listen on help
socket.on("help", () => {
	let text = document.createElement("div");
	text.classList.add("messageText");
	text.innerHTML =
		"<p class='message'>Hit esc key: to erase your chat of content </br></br>Enter wipe# in Chat: Wipes all content from the chat for everyone in the room</br></br> Enter s# in Chat: Locks the chat. You can unlock by entering the room code.  </p>";
	chatroom.appendChild(text);
	chatroom.scrollTop = chatroom.scrollHeight;
});

//listen on wipe chat
socket.on("wipe", () => {
	chatroom.innerHTML = "";
});

//listen on new member join
socket.on("new_member", (data) => {
	let text = document.createElement("p");
	text.classList.add("announcement");
	text.innerHTML = data.username + " has joined the chat";
	chatroom.appendChild(text);
	chatroom.scrollTop = chatroom.scrollHeight;
});

//listen on member left
socket.on("member_left", (data) => {
	let text = document.createElement("p");
	text.classList.add("announcement");
	text.innerHTML = data.username + " has left the chat";
	chatroom.appendChild(text);
	chatroom.scrollTop = chatroom.scrollHeight;
});

//emit message
send_message.addEventListener("click", () => {
	if (message.value) {
		socket.emit("new_message", { message: message.value });
		let text = document.createElement("div");
		text.classList.add("myMessageText");
		text.innerHTML = "<p class='myMessage'>" + message.value + "</p>";
		chatroom.appendChild(text);
		chatroom.scrollTop = chatroom.scrollHeight;
		message.value = "";
	}
});

let typingTimer;
let doneTypingInterval = 1000;
//emit typing event
message.addEventListener("keydown", () => {
	socket.emit("typing");
});

//check if stopped typing or if enter key is hit
message.addEventListener("keyup", (e) => {
	if (e.key === "Enter") {
		// Cancel the default action, if needed
		e.preventDefault();
		// Trigger the button element with a click
		send_message.click();
	} else {
		clearTimeout(typingTimer);
		if (message.value) {
			typingTimer = setTimeout(() => {
				socket.emit("stopped_typing");
			}, doneTypingInterval);
		}
	}
});

//listen to lock event
socket.on("lock", () => {
	card_back.style.display = "flex";
	reenter_room.focus();
});

//listen on enter key for username
reenter_room.addEventListener("keyup", (e) => {
	if (e.key === "Enter") {
		// Cancel the default action, if needed
		e.preventDefault();
		// Trigger the button element with a click
		socket.emit("unlock", { code: reenter_room.value });
	}
});

socket.on("unlock", () => {
	card_back.style.display = "none";
	message.focus();
});

//listen on typing event
socket.on("typing", (data) => {
	feedback.innerHTML = "<i>" + data.username + " is typing ... </i>";
});
socket.on("stopped_typing", (data) => {
	feedback.innerHTML = "";
});

//send close connection
exit.addEventListener("click", () => {
	axios.get("/").then(() => {
		socket.emit("close_connection");
		location.reload();
	});
});
