var pomelo = require('pomelo');
var Room = require('./app/models/Room');
var ChatRoom = require('./app/servers/chat/ChatRoom');
var HallRoom = require('./app/servers/chat/HallRoom');
var routeUtil = require('./app/util/routeUtil');
var mysql = require('./app/models/dao/mysql/mysql');
var code  = require('../shared/code');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo');


var dbclient = mysql.init();
app.set('mysql',dbclient);


// app configure

///edit by hawk 2017.6.6
app.configure('production|development', 'connector', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 3,
			useDict : true,
			useProtobuf : true
		});
});

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useProtobuf : true
		});
});

app.configure('production|development', 'sioconnector', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.sioconnector
		});
});

app.configure('production|development', 'siogate', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.sioconnector
		});
});
///

app.configure('production|development', function() {
	// route configures
	app.route('chat', routeUtil.chat);

	// filter configures
	app.filter(pomelo.timeout());
});

app.configure('production|development', 'chat', function() {
	var serverId = app.getServerId();
	var serNo = parseInt(serverId.split('-')[1]);
	console.log('Starting... serverId=' + serverId + ' serverNo:' + serNo);

	//var dbclient = mysql.init();
	//app.set('mysql',dbclient);

	for (var i = serNo * 5 +1; i <= (serNo + 1) * 5; i++) {
		app.get('mysql').query("select roomType,roomID from Room where roomID = ? ",
			[i], function (err, res) {
				if (err == null) {
					if (!!res && res.length >= 1) {
						var rs = res[0];

						var roomname = "ChatRoom" + rs.roomID;

						switch (rs.roomType) {
							case code.ROOMTYPE.HALL:
								app[roomname] = new HallRoom(app, {roomId: rs.roomID, name: roomname});
								app[roomname].run();
								console.log('Starting...' + roomname + ':Type=' + rs.roomType);
								break;
							case code.ROOMTYPE.CHATROOM:
								app[roomname] = new ChatRoom(app, {roomId: rs.roomID, name: roomname});
								app[roomname].run();
								console.log('Starting...' + roomname + ':Type=' + rs.roomType);
								break;
							case code.ROOMTYPE.EMPTY:
								console.log('Starting...' + roomname + ':Type=' + rs.roomType);
								break;
						}
					}
					else {
						console.log('Err:Can not find the roomID in room table!');
					}
				}

				else
					console.log(err);
			});

	}
});

// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});