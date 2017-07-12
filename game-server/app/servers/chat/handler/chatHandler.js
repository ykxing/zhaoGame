var code = require('../../../../../shared/code');
var chatRemote = require('../remote/chatRemote');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function(msg, session,next) {
	//var username = session.uid.split('*')[0];
	var username = session.uid;
	var rid = session.get('rid');
	var roomNo = 'ChatRoom'+ rid.toString();
	/*
	var nMsg = {
		command: msg.content.command,
		//username: msg.from,
		'username': session.uid,
		para: msg.content.para
	}
	*/
	var nMsg = {
		command: msg.command,
		para: msg.para,
		username: session.uid
	}
	this.app[roomNo].addMsg(nMsg);

/*


	var channelService = this.app.get('channelService');
	var param = {
		route: 'onChat',
		msg: msg.content,
		from: username,
		target: msg.target
	};
	channel = channelService.getChannel(rid, false);

	//the target is all users
	if(msg.target == '*') {
		channel.pushMessage(param);
	}
	//the target is specific user
	else {
		var tuid = msg.target + '*' + rid;
		var tsid = channel.getMember(tuid)['sid'];
		channelService.pushMessageByUids(param, [{
			uid: tuid,
			sid: tsid
		}]);
	}
	*/
/*
	next(null, {
		route: msg.route
	});
*/
	next(null,{

	});
};