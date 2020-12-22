class Player {
	constructor(socket, name) {
		this.socket = socket;
		this.username = name;
	}

	getInfo() {
		return {
			socket: this.socket,
			username: this.username,
		};
	}
}

module.exports = Player;
