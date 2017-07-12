var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function(session, msg, app, cb) {
	/*
	var chatServers = app.getServersByType('chat');
	console.log(chatServers);
	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

	//var res = dispatcher.dispatch(session.get('rid'), chatServers);
	var res = null;
	var roomNo = session.get('rid');
	for(var i = 0; i< chatServers.length; i++)
	{
		var serNo = chatServers[i].id.split('-')[1];

		if(serNo == Math.floor(roomNo/5)) {
			res  = chatServers[i];
			break;
		}
	}
	cb(null, res.id);
	*/
	if(typeof(session)=='number')
		var roomID = session;
	else
		var roomID = session.get('rid');
	var sid = Math.floor((roomID -1)/5);
	var res = 'chatServer-'+ sid;
	//console.log('RoomID='+roomID + ' dispatch to serverID=',res);
	cb(null,res);
};