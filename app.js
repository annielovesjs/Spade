const express = require("express");
const app = express();
const path = require("path");

//set the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//middlewares
app.use(express.static("public"));

//routes
app.get("/", (req, res) => {
	res.render("index");
});

server = app.listen(process.env.PORT || 3000);

const io = require("socket.io")(server);

const Spade = require("./Spade");
app.spade = new Spade();
console.log("server created");

//listen on every connection
io.on("connection", (socket) => {
	console.log("new user connected");
	socket.on("create_or_join_room", (data) => {
		let chatroom;
		let chatroomId;
		if (data.hosting) {
			chatroom = app.spade.createNewChat();
		} else {
			chatroom = app.spade.findChat(data.gameRoom);
			if (!chatroom) {
				socket.emit("invalid_code");
				return;
			}
			if (chatroom.findPlayer(data.username)) {
				socket.emit("name_exists");
				return;
			}
		}
		chatroomId = chatroom.code;
		app.spade.findChat(chatroomId).addPlayer(data.username);
		socket.username = data.username;
		socket.gameRoom = chatroomId;
		socket.join(chatroomId);
		app.spade.addUserRecord(socket.id, chatroomId);
		socket.emit("successfully_joined", { gameRoom: chatroomId });
		socket
			.to(socket.gameRoom)
			.emit("new_member", { username: socket.username });
	});

	//listen on new message and broadcast to all senders
	socket.on("new_message", (data) => {
		let messageLower = data.message.toLowerCase();
		console.log("this is my id: " + socket.gameRoom);
		if (messageLower == "s#") {
			socket.emit("lock");
		} else if (messageLower == "help#") {
			socket.emit("help");
		} else if (messageLower == "wipe#") {
			io.in(socket.gameRoom).emit("wipe", { username: socket.username });
		} else if (messageLower == "quack#") {
			socket.emit("quack");
		} else if (messageLower == "noquack#") {
			socket.emit("noquack");
		} else {
			socket.to(socket.gameRoom).emit("new_message", {
				message: data.message,
				username: socket.username,
				gameRoom: socket.gameRoom,
				hasImage: data.hasImage,
				image: data.image,
			});
		}
	});

	socket.on("unlock", (data) => {
		if (data.code == socket.gameRoom) {
			socket.emit("unlock");
		} else {
			socket.emit("failed_unlock");
		}
	});

	socket.on("typing", (data) => {
		//broadcast means to notify everyone except for the socket that emits the event
		socket.to(socket.gameRoom).emit("typing", {
			username: socket.username,
			gameRoom: socket.gameRoom,
		});
	});
	socket.on("stopped_typing", () => {
		socket.to(socket.gameRoom).emit("stopped_typing");
	});

	//listen for organic disconnect
	socket.on("disconnect", () => {
		console.log("disconnected " + socket.id);
		if (app.spade.findRoomBasedOnId(socket.id)) {
			let gameId = app.spade.findRoomBasedOnId(socket.id).code;
			app.spade.findChat(gameId).removePlayer(socket.username);
			if (app.spade.findChat(gameId).isEmpty()) {
				app.spade.removeChat(gameId);
			}
			io.in(socket.gameRoom).emit("member_left", { username: socket.username });
		}
	});
});
