const Chatroom = require("./Chatroom");

class Spade {
	constructor() {
		this.chatrooms = {};
	}

	createNewChat() {
		let code = this.generateCode();
		this.chatrooms[code] = new Chatroom(code, this.removeChat);
		console.log("created room: " + code);
		return code;
	}

	findChat(code) {
		if (code) {
			return this.chatrooms[code];
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
		this.chatrooms.delete(code);
		console.log("removed this chat : " + code);
	}
}

module.exports = Spade;
