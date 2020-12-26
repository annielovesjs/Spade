class Chatroom {
	constructor(code) {
		this.players = [];
		this.code = code;
	}

	addPlayer(name) {
		this.players.push(name);
	}

	findPlayer(name) {
		return this.players.includes(name);
	}

	removePlayer(player) {
		this.players = this.players.filter((user) => user !== player);
	}

	isEmpty() {
		return this.players.length == 0;
	}
}

module.exports = Chatroom;
