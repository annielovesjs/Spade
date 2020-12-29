const Chatroom = require("./Chatroom");

class Spade {
	constructor() {
		this.chatrooms = {};
		this.userIDToRoom = {};
	}

	addUserRecord(userId, roomId) {
		this.userIDToRoom[userId] = roomId;
		console.log("mapping: " + userId + " to " + roomId);
	}

	findRoomBasedOnId(userId) {
		return this.chatrooms[this.userIDToRoom[userId]];
	}

	createNewChat() {
		let code = this.generateCode();
		this.chatrooms[code] = new Chatroom(code);
		return this.chatrooms[code];
	}

	findChat(code) {
		let chatResult = this.chatrooms[code];
		if (chatResult) {
			return this.chatrooms[code];
		} else {
			return false;
		}
	}

	generateCode() {
		const possible = "abcdefghijklmnopqrstuvwxyz";
		let code;
		do {
			//generate 5 letter code
			code = "";
			for (var i = 0; i < 5; i++) {
				code += possible.charAt(Math.floor(Math.random() * possible.length));
			}
			//make sure the code is not already in use
		} while (this.chatrooms[code]);
		return code;
	}

	removeChat(code) {
		console.log("removed this chat : " + code);
		delete this.chatrooms[code];
		console.log(this.chatrooms);
	}

	clearSpadeRecords() {
		this.chatrooms = {};
	}
}

module.exports = Spade;
