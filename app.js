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

//listen on every connection
io.on("connection", (socket) => {
	console.log("new user connected");
	//listen on change username -- merge with create room later
	socket.on("change_username", (data) => {
		socket.username = data.username;
		socket.gameRoom = data.gameRoom;
		socket.join(data.gameRoom);
		console.log("this is joined: " + data.gameRoom);
		socket.emit("successfully_joined", { gameRoom: data.gameRoom });
		socket
			.to(socket.gameRoom)
			.emit("new_member", { username: socket.username });
	});

	socket.on("create_room", (data) => {
		let gameRoomId = app.spade.createNewChat();
		socket.username = data.username;
		socket.gameRoom = gameRoomId;
		console.log(socket.gameRoom);
		socket.join(gameRoomId);
		socket.emit("successfully_joined", { gameRoom: gameRoomId });
		socket
			.to(socket.gameRoom)
			.emit("new_member", { username: socket.username });
	});
	//listen on new message and broadcast to all senders
	socket.on("new_message", (data) => {
		console.log("this is my id: " + socket.gameRoom);
		if (data.message == "s#") {
			socket.emit("lock");
		} else if (data.message == "help#") {
			socket.emit("help");
		} else if (data.message == "wipe#") {
			io.in(socket.gameRoom).emit("wipe");
		} else if (data.message == "quack#") {
			socket.emit("quack");
		} else if (data.message == "noquack#") {
			socket.emit("noquack");
		} else {
			socket.to(socket.gameRoom).emit("new_message", {
				message: data.message,
				username: socket.username,
				gameRoom: socket.gameRoom,
			});
		}
	});

	socket.on("unlock", (data) => {
		if (data.code == socket.gameRoom) {
			socket.emit("unlock");
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
	//listen for disconnect event
	socket.on("close_connection", () => {
		console.log("disconnect");
		io.in(socket.gameRoom).emit("member_left", { username: socket.username });

		socket.disconnect();
	});

	//listen for organic disconnect
	socket.on("disconnect", () => {
		console.log("organic disconnect");
		io.in(socket.gameRoom).emit("member_left", { username: socket.username });
	});
});
