const Player = require("./Player");

class Chatroom {
	constructor(code, removePlayerFn) {
		this.players = [];
		this.code = code;
		this.removePlayerFn = removePlayerFn;
	}

	addPlayer(socket, name) {
		const player = new Player(socket, name);
		//TODO: notify new person joined the chat
		this.attachListeners(player);
		this.players.push[player];
	}

	attachListeners(player) {
		const { socket } = player;
	}

	removePlayer(player) {
		player.socket.disconnect(true);
		if (this.players.length == 0) {
			this.removePlayerFn();
		}
	}
}

module.exports = Chatroom;
