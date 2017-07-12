var code = require('../../../../../shared/code');
var Token = require('../../../../../shared/token');
//var secret = require('../../../../../shared/config/session').secret;
//var expire = require('../../../../../shared/config/session').expire;
module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;
	var rid = msg.rid;
	//var uid = msg.username + '*' + rid;
	var uid = msg.username;
	var token = msg.token;
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	if( !! sessionService.getByUid(uid)) {
		console.log('User is already login! ');
		next(null, {
			code: code.RETURNCODE.DUPLICATEUSER,
			message: 'The User has already logged in'
		});
		return;
	}

	//	Auth token
	var res = Token.validate(token);
	if(res != 0) {
		next(null, {
			code: code.RETURNCODE.EXPIRED,
			message:'token expired'
		});
		return;
	}
	/*
	var res = Token.parse(token, secret);
	if(!res) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}
	//check whether expire.
	if(expire > 0) {
		if((Date.now() - res.timestamp) > expire){
			next(null, {
				code: 500,
				error: true
			});
			return;
		}

	}
	*/

	session.bind(uid);
	session.set('rid', rid);
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onUserLeave.bind(null, self.app));

	//put user into channel
	self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
		next(null, {
			users:users
		});
	});
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid) {
		return;
	}

	app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};

/**
 * append by hawk
 *
 */
handler.connect = function(msg, session, next) {
	var self = this;
	var rid = msg.rid;
	var uid = msg.username;
	var token = msg.token;
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	if( !! sessionService.getByUid(uid)) {
		console.log('User is already login! ');
		next(null, {
			code: code.RETURNCODE.DUPLICATEUSER,
			message: 'The User has already logged in'
		});
		return;
	}

	//	Auth token
	var res = Token.validate(token);
	if(res != 0) {
		next(null, {
			code: code.RETURNCODE.EXPIRED,
			message:'token expired'
		});
		return;
	}

	session.bind(uid);
	session.set('rid', rid);
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onUserLeave.bind(null, self.app));

	next(null, {
		code: code.RETURNCODE.OK,
		message:'Connect to frontServer successfully'
	});

};

handler.enterRoom = function(msg, session, next) {
	var self = this;
	var rid = msg.rid;
	var uid = msg.username;
	var token = msg.token;
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	if( !! sessionService.getByUid(uid)) {
		console.log('User is already login! ');

	}
	else{
		next(null, {
			code: code.RETURNCODE.ERROR,
			message: 'The User has not connnected'
		});

	}



	session.bind(uid);
	session.set('rid', rid);
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onUserLeave.bind(null, self.app));

	next(null, {
		code: code.RETURNCODE.OK,
		message:'Connect to frontServer successfully'
	});

};