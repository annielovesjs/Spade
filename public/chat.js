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
let card = document.getElementById("card");
let card_back = document.getElementById("card_back");
let reenter_room = document.getElementById("reenter_room");
let join_chat_direct = document.getElementById("join_chat_direct");
let joinRoomForm = document.getElementById("joinRoomForm");
let intro = document.getElementsByClassName("intro")[0];
let nameError = document.getElementById("nameError");
let roomNameError = document.getElementById("roomNameError");
let imgPicker = document.getElementById("imagePicker");
let input_zone = document.getElementById("input_zone");
let inputPad = document.getElementsByClassName("inputPad")[0];

const audio = new Audio("Quack.mp3");

username.focus();
window.notificationCount = 0;

document.addEventListener("visibilitychange", function () {
	if (!document.hidden) {
		document.title = "Spade";
		window.notificationCount = 0;
	}
});

function openGallery(e) {
	console.log(e);
	let galleryWindow = document.createElement("div");
	galleryWindow.classList.add("galleryWindow");
	let galleryNav = document.createElement("div");
	galleryNav.classList.add("galleryNav");
	galleryNav.innerHTML =
		"<div class='icon galleryExit' onclick='closeGallery()'><img src='exit.svg'/></div>";
	galleryWindow.append(galleryNav);
	let imgGallery = document.createElement("img");
	imgGallery.src = e.src;
	galleryWindow.append(imgGallery);
	card.append(galleryWindow);
}

function closeGallery() {
	document.getElementsByClassName("galleryWindow")[0].remove();
}

function removeImage() {
	document.getElementById("imagePicker").value = null;
	document.getElementsByClassName("thumbnail")[0].remove();
	inputPad.style.padding = "0px";
}

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object

	// Loop through the FileList and render image files as thumbnails.
	for (var i = 0, f; (f = files[i]); i++) {
		// Only process image files.
		if (!f.type.match("image.*")) {
			continue;
		}

		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function (theFile) {
			return function (e) {
				//remove existing thumbnail
				let thumbnailExists = document.getElementsByClassName("thumbnail")[0];
				if (thumbnailExists) {
					thumbnailExists.remove();
				}
				// Render thumbnail.
				var span = document.createElement("span");
				span.classList.add("thumbnail");
				span.innerHTML = [
					'<div class="removeImage icon" onclick="removeImage()"><img class="removeSvg" src="exit.svg"/></div><img id="thumb" src="',
					e.target.result,
					'" title="',
					escape(theFile.name),
					'"/>',
				].join("");
				inputPad.style.padding = "15px";
				inputPad.insertBefore(span, inputPad.childNodes[0]);
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	}
}

imgPicker.addEventListener("change", handleFileSelect, false);

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
	if (data.message) {
		let text = document.createElement("div");
		text.classList.add("messageText");
		text.innerHTML =
			"<p class='message'>" + data.username + ": " + data.message + "</p>";
		chatroom.appendChild(text);
	}

	if (data.hasImage) {
		let img = document.createElement("div");
		img.classList.add("messageText");
		img.innerHTML = "<img class='messageImg' src='" + data.image + "'/>";
		chatroom.appendChild(img);
	}
	chatroom.scrollTop = chatroom.scrollHeight;
	if (document.hidden) {
		window.notificationCount += 1;
		document.title = "(" + window.notificationCount + ") Spade";
		if (socket.quack) {
			audio.play();
		}
	}
});

//listen to quack
socket.on("quack", () => {
	socket.quack = true;
});

//listen to unquack
socket.on("noquack", () => {
	socket.quack = false;
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
	inputPad.style.padding = "0px";

	if (message.value || imgPicker.files.length > 0) {
		socket.emit("new_message", {
			message: message.value,
			hasImage: document.getElementById("thumb") ? true : false,
			image: !document.getElementById("thumb")
				? ""
				: document.getElementById("thumb").src,
		});
		if (message.value) {
			let text = document.createElement("div");
			text.classList.add("myMessageText");
			text.innerHTML = "<p class='myMessage'>" + message.value + "</p>";
			chatroom.appendChild(text);
		}

		if (imgPicker.files.length > 0) {
			let img = document.createElement("div");
			img.classList.add("myMessageText");
			img.innerHTML =
				"<img class='messageImg' onclick='openGallery(this)' src='" +
				document.getElementById("thumb").src +
				"'/>";
			chatroom.appendChild(img);
			document.getElementsByClassName("thumbnail")[0].remove();
		}
		chatroom.scrollTop = chatroom.scrollHeight;
		message.value = "";
		imgPicker.value = null;
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
