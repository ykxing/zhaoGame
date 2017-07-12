var code = require('../../../../../shared/code');

module.exports = function(app) {
	return new ChatRemote(app);
};

var ChatRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function(uid, sid, name, flag, cb) {

	var channel = this.channelService.getChannel(name, flag);

/*
	var param = {
		route: 'onAdd',
		user: username
	};
	channel.pushMessage(param);
*/
	if( !! channel) {
		channel.add(uid, sid);
	}
	//console.log(channel);
	//var username = uid.split('*')[0];
	username = uid;
	var msg ={
		command: code.COMMAND.LOGIN,
		username: username
	};
	this.app["ChatRoom"+name.toString()].addMsg(msg);
	console.log(username+" login room "+ name);
	//cb(this.get(name, flag));
	cb(null);
};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
ChatRemote.prototype.get = function(name, flag) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	for(var i = 0; i < users.length; i++) {
		users[i] = users[i].split('*')[0];
	}
	return users;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
ChatRemote.prototype.kick = function(uid, sid, name, cb) {
	//var username = uid.split('*')[0];
	var username = uid;
	var msg ={
		command: code.COMMAND.LOGOUT,
		username: username
	};
	this.app["ChatRoom"+name.toString()].addMsg(msg);
	var channel = this.channelService.getChannel(name, false);
	// leave channel
	if( !! channel) {
		channel.leave(uid, sid);
	}
	console.log(username+" logout room "+ name);
   /*
	var param = {
		route: 'onLeave',
		user: username
	};
	channel.pushMessage(param);
	*/
	cb();
};

/**
 * Notify to hall.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
ChatRemote.prototype.notifyToRoom = function(toRoomID,msg,cb) {

	this.app["ChatRoom"+ toRoomID.toString()].addMsg(msg);
	//console.log('add msg to '+"ChatRoom"+ toRoomID.toString());
	cb();

};
