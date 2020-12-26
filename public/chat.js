let socket = io();
let message = document.getElementById("message");
let usernameHost = document.getElementById("usernameHost");
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
let unlock_room = document.getElementById("unlock_room");
let landingPage = document.getElementsByClassName("landingPage")[0];
let createRoomPage = document.getElementById("createRoomPage");
let create_room_direct = document.getElementById("create_room_direct");
let join_chat_direct = document.getElementById("join_chat_direct");
let joiningPage = document.getElementsByClassName("joiningPage")[0];
let joinRoomForm = document.getElementById("joinRoomForm");
let intro = document.getElementsByClassName("intro")[0];
let nameError = document.getElementById("nameError");
let roomNameError = document.getElementById("roomNameError");
let nameJoinError = document.getElementById("nameJoinError");
let unlockError = document.getElementById("unlockError");
let imgPicker = document.getElementById("imagePicker");
let inputPad = document.getElementsByClassName("inputPad")[0];

const audio = new Audio("Quack.mp3");
makeAnnouncement("Send help# in chat to see useful features");

usernameHost.focus();
window.notificationCount = 0;

function makeAnnouncement(messageStr) {
	createAndAddHtmlElement("p", "announcement", messageStr, chatroom);
	chatroom.scrollTop = chatroom.scrollHeight;
}

function createAndAddHtmlElement(divType, className, htmlElStr, parentDiv) {
	let el = document.createElement(divType);
	el.classList.add(className);
	el.innerHTML = htmlElStr;
	parentDiv.appendChild(el);
}

function createEnterEvent(e, desiredEl) {
	if (e.key === "Enter") {
		e.preventDefault();
		desiredEl.click();
	}
}

function displayError(errorEl, text) {
	errorEl.innerHTML = text;
	errorEl.style.display = "block";
}

function openGallery(e) {
	let galleryWindow = document.createElement("div");
	galleryWindow.classList.add("galleryWindow");
	let innerHtmlEl =
		"<div class='icon galleryExit' onclick='closeGallery()'><img src='exit.svg'/></div>";
	createAndAddHtmlElement("div", "galleryNav", innerHtmlEl, galleryWindow);
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
	message.focus();
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
				message.focus();
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	}
}

document.addEventListener("visibilitychange", function () {
	if (!document.hidden) {
		document.title = "Spade";
		window.notificationCount = 0;
	}
});

imgPicker.addEventListener("change", handleFileSelect, false);

//listen to esc key
document.getElementsByTagName("body")[0].addEventListener("keyup", (e) => {
	if (e.key == "Escape") {
		let gallery = document.getElementsByClassName("galleryWindow")[0];
		if (gallery) {
			gallery.remove();
		} else {
			chatroom.innerHTML = "";
		}
	}
});

//join game redirect
join_chat_direct.addEventListener("click", () => {
	landingPage.style.display = "none";
	joiningPage.style.display = "flex";
	username.focus();
});

//create game redirect
create_room_direct.addEventListener("click", () => {
	landingPage.style.display = "none";
	createRoomPage.style.display = "flex";
	usernameHost.focus();
});

//join chat room
send_username.addEventListener("click", () => {
	if (username.value) {
		if (chatID.value) {
			user = username.value;
			socket.emit("create_or_join_room", {
				username: username.value,
				gameRoom: chatID.value.toLowerCase(),
				hosting: false,
			});
			roomNameError.style.display = "none";
		} else {
			displayError(roomNameError, "Please enter valid room code");
		}
	} else {
		displayError(nameJoinError, "Please enter a name");
	}
});

//check for invalid room
socket.on("invalid_code", () => {
	displayError(roomNameError, "Invalid room, please double check the code.");
});

//check for name already exists error
socket.on("name_exists", () => {
	displayError(
		nameJoinError,
		"Name is already taken by another user in the chat"
	);
});

//create room button
create_room.addEventListener("click", () => {
	if (usernameHost.value) {
		socket.emit("create_or_join_room", {
			username: usernameHost.value,
			hosting: true,
		});
	} else {
		displayError(nameError, "Please enter a name");
	}
});

//admit to game room
socket.on("successfully_joined", (data) => {
	modal.style.display = "none";
	chatroomTitle.innerHTML = "Room: " + data.gameRoom;
	message.focus();
});

chatID.addEventListener("keyup", (e) => {
	createEnterEvent(e, send_username);
});

//listen on enter key for username
usernameHost.addEventListener("keyup", (e) => {
	createEnterEvent(e, create_room);
});

//listen on new message
socket.on("new_message", (data) => {
	let innerHtmlEl;
	if (data.message) {
		innerHtmlEl =
			"<p class='message'>" + data.username + ": " + data.message + "</p>";
		createAndAddHtmlElement("div", "messageText", innerHtmlEl, chatroom);
	}

	if (data.hasImage) {
		innerHtmlEl = "<img class='messageImg' src='" + data.image + "'/>";
		createAndAddHtmlElement("div", "messageText", innerHtmlEl, chatroom);
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
	makeAnnouncement("quack has been enabled");
});

//listen to unquack
socket.on("noquack", () => {
	socket.quack = false;
	makeAnnouncement("quack has been disabled");
});

//listen on help
socket.on("help", () => {
	makeAnnouncement("Hit esc key: to erase your chat of content");
	makeAnnouncement(
		"Enter wipe# in Chat: Wipes all content from the chat for everyone in the room"
	);
	makeAnnouncement(
		"Enter s# in Chat: Locks the chat. You can unlock by entering the room code."
	);
});

//listen on wipe chat
socket.on("wipe", (data) => {
	chatroom.innerHTML = "";
	makeAnnouncement(data.username + " has cleared the chat");
});

//listen on new member join
socket.on("new_member", (data) => {
	makeAnnouncement(data.username + " has joined the chat");
});

//listen on member left
socket.on("member_left", (data) => {
	makeAnnouncement(data.username + " has left the chat");
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
			createAndAddHtmlElement(
				"div",
				"myMessageText",
				"<p class='myMessage'>" + message.value + "</p>",
				chatroom
			);
		}

		if (imgPicker.files.length > 0) {
			let innerHtmlEl =
				"<img class='messageImg' onclick='openGallery(this)' src='" +
				document.getElementById("thumb").src +
				"'/>";
			createAndAddHtmlElement("div", "myMessageText", innerHtmlEl, chatroom);
			document.getElementsByClassName("thumbnail")[0].remove();
		}
		chatroom.scrollTop = chatroom.scrollHeight;
		message.value = "";
		imgPicker.value = null;
	}
	message.focus();
});

let typingTimer;
let doneTypingInterval = 1000;
//emit typing event
message.addEventListener("keydown", () => {
	socket.emit("typing");
});

//check if stopped typing or if enter key is hit
message.addEventListener("keyup", (e) => {
	createEnterEvent(e, send_message);
	if (e.key !== "Enter") {
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

//listen to unlock click
unlock_room.addEventListener("click", () => {
	socket.emit("unlock", { code: reenter_room.value });
});

//failed unlock event
socket.on("failed_unlock", () => {
	displayError(unlockError, "Wrong code, try again.");
});

//listen on enter key for username
reenter_room.addEventListener("keyup", (e) => {
	createEnterEvent(e, unlock_room);
});

//unlock room
socket.on("unlock", () => {
	card_back.style.display = "none";
	unlockError.style.display = "none";
	message.focus();
});

//listen on typing event
socket.on("typing", (data) => {
	feedback.innerHTML = "<i>" + data.username + " is typing ... </i>";
});

//listen on stopped typing event
socket.on("stopped_typing", (data) => {
	feedback.innerHTML = "";
});

//send close connection
exit.addEventListener("click", () => {
	axios.get("/").then(() => {
		location.reload();
	});
});
