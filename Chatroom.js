class Chatroom {
	constructor(code) {
		this.users = [];
		this.code = code;
	}

	addUser(name) {
		this.users.push(name);
	}

	findUser(name) {
		return this.users.includes(name);
	}

	removeUser(username) {
		this.users = this.users.filter((user) => user !== username);
	}

	isEmpty() {
		return this.users.length == 0;
	}
}

module.exports = Chatroom;
