var express = require('express');
var Token = require('../shared/token');
var code = require('../shared/code');
var async = require('async');
//var secret = require('../shared/config/session').secret;
var userDao = require('./lib/dao/userDao');
var mysql = require('./lib/dao/mysql/mysql');
var app = express.createServer();


app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.set('view engine', 'jade');
	app.set('views', __dirname + '/public');
	app.set('view options', {layout: false});
	app.set('basepath',__dirname + '/public');
});

app.configure('development', function(){
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	var oneYear = 31557600000;
	app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
	app.use(express.errorHandler());
});

//only for test
app.post('/InitRooms', function(req, res) {
	for(var i = 0; i<100; i++)
	{
		mysql.query('insert into Room (roomName,roomType,roomDescrib) values (?,?,?)', ['EmptyRoom',code.ROOMTYPE.EMPTY,'available'], function (err, re) {

		});
	}
	res.send({code: code.RETURNCODE.OK, message: code.CODESTRING.OK});
});

app.post('/login', function(req, res) {
	var msg = req.body;

	var username = msg.username;
	var pwd = msg.password;
	if (!username || !pwd) {
		res.send({code: code.RETURNCODE.NONAME});
		return;
	}
	mysql.query('select userName,passWord,userType,parent,roomID,balance from User where userName = ?',[username],function(err,re){
		if(err == null)
		{
			if(re!= null && re.length >=1)
			{
				var rs = re[0];
				if (pwd != rs.passWord) {
					res.send({code: code.RETURNCODE.WRONGPASS,message:code.CODESTRING.WRONGPASS});
					return;
				}
				res.send({code: code.RETURNCODE.OK, 'token': Token.create(rs.userName, Date.now()), 'userName': rs.userName,'userType': rs.userType,'parent':rs.parent,'balance': rs.balance,'roomID': rs.roomID});

			}
			else {
				res.send({code: code.RETURNCODE.WRONGPASS, message: code.CODESTRING.WRONGPASS});
			}
		}
		else {
			res.send({code:code.RETURNCODE.DBERROR,message:code.CODESTRING.DBERROR});
		}

	});
  });

app.post('/register', function(req, res) {

	var msg = req.body;

	if (!msg.name || !msg.password ||!msg.pname) {
		console.log("name or password or indroduser is empty!");
		return;
	}

	console.log(msg.name + ":" + msg.password + ":" + msg.pname);

	async.waterfall([
		function(callback){
		mysql.query("select userName from  User where userName = ?",[msg.name],function(err,res){
			if(err == null){
				if(res.length >=1){
					callback('User with this name is already exist!');
				}
				else{
					callback(null);
				}

			}
			else {
				callback(err);
			}
		});
		},
		function(callback){
			mysql.query("select roomID,userType from User where userName = ?", [msg.pname],function(err,res) {
				if(err == null){
					if(res.length<=0){
						callback('Introduer do not exist!');
					}else{
						var userType;

						if(res[0].userType == code.USERTYPE.SUPERVISER){
							userType = code.USERTYPE.BOSS;
							callback(null,res[0].roomID,userType);
						}
						else{
							if(res[0].userType == code.USERTYPE.LEVEL1 ||(res[0].userType == code.USERTYPE.BOSS && res[0].roomID > 0)){
								userType = code.USERTYPE.USER;
								callback(null,res[0].roomID,userType);
							}
							else{
								callback("Indruder Have No Right");
							}
						}

					}
				}else{
					callback(err);
				}
			});
			},
		function(roomID,nUserType,callback){
			mysql.query("insert into User (userName,passWord,parent,userType,roomID) values(?,?,?,?,?)",[msg.name, msg.password, msg.pname,nUserType,roomID],function(err,res) {
				if(err == null){
					callback(null);
				}
				else{
					callback(err);
				}
			});

		}
		],

		function(err,result){
			if(err ==null){
				res.send({code: code.RETURNCODE.OK});
			}
			else{
				res.send({code: code.RETURNCODE.ERROR,msg: err});
			}

	});

});

app.post('/getUserInfo', function(req, resp) {
	var msg = req.body;

	var username = msg.username;
	var token = msg.token;

	if (Token.validate(token)!=0) {
		resp.send({code: code.RETURNCODE.WRONGPASS,message:'Toekn error'});
		return;
	}
	async.waterfall([
			function(callback){
				mysql.query('select userName,userType,parent,roomID,balance,waitBalance from User where userName = ?',[username],function(err,res) {
					if(err == null && res.length > 0){
						if(res[0].waitBalance != 0) {
							callback(null, res[0].balance + res[0].waitBalance);
						}
						else{
							var rs = res[0];
							//res.send({code: code.RETURNCODE.OK, balance: rs.balance});
							resp.send({code: code.RETURNCODE.OK, 'userName': rs.userName,'userType': rs.userType,'parent':rs.parent,'balance': rs.balance,'roomID': rs.roomID});
							callback('no need to update');
						}

					}
					else{
						callback(err);
					}
				});
			},
			function(nBalance,callback){
				mysql.query('update User set balance = ?, waitBalance = ?   where userName = ?', [nBalance,0,username], function (err, res) {
					if (err == null) {
						callback(null);
					}
					else {
						callback(err);
					}

				});
			}],
		function(err,result){

		});

});

app.post('/getUsersInfo', function(req, res) {
	console.log('getUsersInfo...');

	var msg = req.body;

	var username = msg.username;
	var token = msg.token;
	var parent = msg.parent;

	if (Token.validate(token)!=0) {
		res.send({code: code.RETURNCODE.WRONGPASS,message:'Toekn error'});
		return;
	}

	mysql.query('select userName,userType,balance,waitBalance from User where userName = ? or parent = ?', [username, username], function (err, re) {
		if (err == null) {
			if (re != null && re.length >= 1) {
				res.send({'code': code.RETURNCODE.OK, 'users': re});
			}
			else {
				res.send({code: code.RETURNCODE.DBERROR, message: 'Not find!'});
			}
		}
		else {
			res.send({code: code.RETURNCODE.DBERROR, message: 'access data error'});
		}

	});

});

app.post('/updateAccount', function(req, res) {
	var msg = req.body;
	var username = msg.username;
	var token = msg.token;
	var target = msg.target;
	var score = parseInt(msg.score);
	var operationType = parseInt(msg.operationType);
	if (Token.validate(token)!=0) {
		res.send({code: code.RETURNCODE.WRONGPASS,message:'Token error'});
		return;
	}

	mysql.query('CALL chargeToAccount(?,?,?,?,?)',[username,0,score,0,target], function(err, rows ) {
		if (err == null) {
			console.log('call chargeToAccount OK');
		}
		else{
			console.log('call chargeToAccount find err:');
			console.log(err);
		}

	});


	async.waterfall([
		function(callback){  //retrieve info of target
			mysql.query('select balance,waitBalance,roomID,userID,parent from User where userName = ? ',[target],function(err,res){
				if(err == null && res.length >0){
					if(res[0].parent  == msg.username) {
						callback(null, res[0].userID, res[0].balance, res[0].waitBalance, res[0].roomID);
					}
					else{
						callback('Parent has NO Right');
					}
				}
				else{
					callback(err);
				}
			});
		},

		function(targetID,balance,waitBalance,roomID,callback){  //retrieve info of parent

			mysql.query('select userID,balance,waitBalance,userType,roomID from User where userName = ? ',[username],function(err,res){
				if(err == null  && res.length >0){
					if((res[0].userType == code.USERTYPE.BOSS||res[0].userType == code.USERTYPE.LEVEL1)&&(res[0].roomID == roomID)) {
						if(res[0].userType == code.USERTYPE.BOSS){
							callback(null, targetID, balance, waitBalance, res[0].userID,true, res[0].balance, res[0].waitBalance);
						}
						else{
							callback(null, targetID, balance, waitBalance, res[0].userID,false, res[0].balance, res[0].waitBalance);
						}
					}
					else{
						callback('This Type Of  User Has NO Right');
					}
				}
				else{
					callback(err);
				}
			});
		},
		function(targetID,balance,waitBalance,userID,bIfBoss,uBalance,uWaitBalance,callback){  //update target
			var nscore = 0;
			if(operationType == code.OPERATIONTYPE.UPSCORE) {
				if(bIfBoss == true ||( bIfBoss == false && uBalance >= msg.score)) {
					nscore = parseInt(waitBalance) + parseInt(msg.score);
				}
				else{
					callback('User Has not Enough Score!');
					return;
				}

			}
			else {

				if ((balance + waitBalance)  < msg.score) {
						callback('target user has not enought score');
						return;
					}
					else {
						nscore = waitBalance - score;
				}
			}
			mysql.query('update User set waitBalance = ? where userName = ? ',[nscore,target],function(err,res){
				if(err == null){
					callback(null,targetID,balance,waitBalance,userID,bIfBoss,uBalance,uWaitBalance);
				}
				else{
					callback(err);
				}
			});
		},
		function(targetID,balance,waitBalance,userID,bIfBoss,uBalance,uWaitBalance,callback){  ////update parent
			var nscore = 0;
			if(operationType == code.OPERATIONTYPE.UPSCORE) {
				nscore = parseInt(uBalance) - parseInt(msg.score);
			}
			else {
				nscore = uBalance + score;
			}
			mysql.query('update User set Balance = ? where userName = ? ',[nscore,msg.username],function(err,res){
				if(err == null){
					callback(null,targetID,userID);
				}
				else{
					callback(err);
				}
			});
		},
		function(targetID,userID,callback){   //logging for target
			mysql.query('insert into Account (userID,score,operation,target,note) values (?,?,?,?,?)',[targetID,score,operationType,userID,msg.username],function(err,res){
				if(err == null){
					callback(null,targetID,userID);
				}
				else{
					callback(err);
				}
			});
		},

		function(targetID,userID,callback){ //logging for parent
			if(msg.operationType == code.OPERATIONTYPE.UPSCORE){
				var opType = code.OPERATIONTYPE.UPSCORETO;
			}
			else{
				var opType = code.OPERATIONTYPE.DOWNSCORETO;
			}

			mysql.query('insert into Account (userID,score,operation,target,note) values (?,?,?,?,?)',[userID,score,opType,targetID,msg.target],function(err,res){
				if(err == null){
					callback(null);
				}
				else{
					callback(err);
				}
			});
		}

	],function(err,result){
		if(err != null) {
			res.send({code: code.RETURNCODE.ERROR,message:err});
		}
		else {
			res.send({code: code.RETURNCODE.OK, message: 'OK'});
		}
	});

});
app.post('/updateUserType', function(req, res) {
	var msg = req.body;
	var username = msg.username;
	var token = msg.token;
	var target = msg.target;
	var userType = parseInt(msg.userType);


	if (Token.validate(token)!=0) {
		res.send({code: code.RETURNCODE.WRONGPASS,message:'Toekn error'});
		return;
	}
	console.log('hawk:'+username+target+"-"+ userType);
	async.waterfall([
		function(callback){  //retrieve info of target
			mysql.query('select userType,parent from User where userName = ? ',[target],function(err,res){
				if(err == null && res.length >0){
					if(res[0].userType == msg.userType || res[0].parent != msg.username){
						callback('不需要更改用户类型');
					}else {
						callback(null);
					}
				}
				else{
					callback('功能错误');
				}
			});
		},

		function(callback){  //retrieve info of parent

			mysql.query('select userType,roomID from User where userName = ? ',[username],function(err,res){
				if(err == null  && res.length >0){
					if(res[0].userType == code.USERTYPE.BOSS) {
						callback(null);
					}
					else{
						callback("只有老板才有权限更改用户类型");
					}
				}
				else{
					callback(err);
				}
			});
		},
		function(callback){  //update user type
			mysql.query('update User set userType = ? where userName = ? ',[msg.userType,target],function(err,res){
				if(err == null){
					callback(null);
				}
				else{
					callback(err);
				}
			});
		}

	],function(err,result){
		if(err != null) {
			console.log('Interuped by Error:' + err);
			res.send({code: code.RETURNCODE.ERROR,message:err});
		}
		else {
			console.log(result);
			res.send({code: code.RETURNCODE.OK, message: 'OK'});
		}
	});

});
app.post('/getAccount', function(req, response) {
	var msg = req.body;

	var username = msg.username;
	var token = msg.token;
	var target = msg.target;

	if (Token.validate(token)!=0) {
		res.send({code: code.RETURNCODE.ERROR,message:"Token Expirated"});
		return;
	}
	mysql.query('select *  from Transactions  where userID = (select userID from User where userName = ?) and target = (select userID from User where userName = ?)',[username,target],function(err,res) {
		if (err == null) {
			if (res.length > 0) {
				console.log(res);
				response.send({code: code.RETURNCODE.OK, 'account': res});
			}
		}
		else {
				console.log(err);
			response.send({code: code.RETURNCODE.ERROR,message:err});
		}
	});
	/*
	async.waterfall([
			function(callback){
				console.log('Get User ID ');
				mysql.query('select userID from User where userName = ? ',[target],function(err,res) {
					if(err == null && res.length > 0){
						callback(null,res[0].userID);

					}
					else{
						callback(err);
					}
				});
			},
			function(userID,callback){
				console.log('Get Account');
				mysql.query('select userID,operation, score,time,target,note from Account  where userID = ?', [userID], function (err, res) {
					if (err == null) {
						callback(null,res);
					}
					else {
						callback(err);
					}

				});
			}],
		function(err,result){
			if(err != null) {
				res.send({code: code.RETURNCODE.ERROR,message:err});
			}
			else {
				res.send({code: code.RETURNCODE.OK,'account': result});
			}
		});
		*/
});

//获取所有大厅
app.post('/getHalls', function(req, res) {
	var msg = req.body;
	var username = msg.username;
	var token = msg.token;
	if (Token.validate(token)!=0) {
		res.send({code: code.CODESTRING.DBERROR, DBERROR:'token error!'});
		return;
	}

	mysql.query('select roomID,roomName,roomDescrib,userName from Room where roomType = 1',[],function(err,re){
		if(err == null)
		{
			if(re!= null && re.length >=1)
			{
				res.send({code: code.RETURNCODE.OK, 'Halls': re});
			}
			else {
				res.send({code: code.CODESTRING.DBERROR, message: 'err find!'});
				console.log("err find!");
			}
		}
		else {
			console.log(err);
			res.send({code:code.CODESTRING.DBERROR,message:'access data erro'});
			console.log("access data erro");
		}

	});

});

//获取指定大厅下面的所有房间
app.post('/getRooms', function (req, res) {
	var msg = req.body;
	var username = msg.username;
	var token = msg.token;
	if (Token.validate(token) != 0) {
		res.send({code: code.CODESTRING.DBERROR, DBERROR: 'token error!'});
		return;
	}

	mysql.query('select roomID,roomName,roomDescrib,roomType,config from Room where parent = ?', [msg.roomID], function (err, re) {
		if (err == null) {
			if (re != null && re.length >= 1) {
				res.send({code: code.RETURNCODE.OK, 'rooms': re});
			}
			else {
				res.send({code: code.CODESTRING.DBERROR, message: 'err find!'});
				console.log("err find!");
			}
		}
		else {
			console.log(err);
			res.send({code: code.CODESTRING.DBERROR, message: 'access data erro'});
			console.log("access data erro");
		}

	});

});
app.post('/updateRooms', function (req, res) {
	var msg = req.body;
	var username = msg.username;
	var token = msg.token;
	var fieldName = msg.fieldName;
	var fieldValue = msg.fieldValue;
	var roomID = msg.roomID;

	if (Token.validate(token) != 0) {
		res.send({code: code.RETURNCODE.WRONGPASS, message: 'Toekn error'});
		return;
	}
	console.log('update rooms');

	mysql.query('update Room set config = ? where roomID = ? ', [msg.fieldValue,msg.roomID], function (err, re) {
		if (err == null) {
			res.send({code: code.RETURNCODE.OK, message: 'OK'});
		}
		else {
			res.send({code: code.RETURNCODE.ERROR, message: err});
		}
	});
});
//获取用户的所有下级
app.post('/getUserParent', function(req, res) {
	var msg = req.body;
	var username = msg.username;
	var token = msg.token;

	if (Token.validate(token)!=0) {
		res.send({code: code.RETURNCODE.DBERROR,message:'token error!'});
		return;
	}

	mysql.query('select * from User where parent = ? and roomID = 0',[username],function(err,re){
		if(err === null)
		{
			if(re!= null && re.length >=1)
			{
				res.send({code: code.RETURNCODE.OK, message: re});
			}
			else {
				res.send({code: code.RETURNCODE.DBERROR, message: 'err find!'});
			}
		}
		else {
			console.log(err);
			res.send({code:code.RETURNCODE.DBERROR,message:'access data erro'});
		}
	});
});

//创建大厅
app.post('/createHall', function(req, res) {
	var msg = req.body;

	async.waterfall([
		function(callback){
		mysql.query('select roomID,roomtype from Room where roomType = ? limit 1',[code.ROOMTYPE.EMPTY],function(err,res){
			if(err == null){
				if(res.length >=1){
					callback(null,res[0].roomID);
				}
				else{
					callback('No Room Available!')
				}

			}
			else{
				callback(err);
			}
		});
		},
		function(roomID,callback){
			mysql.query('update Room set roomName=?, roomDescrib=?, userName=?, roomType=? where roomID = ?',[msg.hallName, msg.createHallDesc, msg.hallBoss,code.ROOMTYPE.HALL,roomID],function(err,res){
				if(err == null){
					callback(null,roomID);
				}else{
					callback(err);
				}

			});
		},

			function(roomID,callback){
				mysql.query('update User set roomID = ? where parent = ? or userName = ?',[roomID,msg.hallBoss, msg.hallBoss],function(err,res) {
					if(err == null){
						callback(null);
					}else{
						callback(err);
					}

				});
			}
		],
		function(err,result){
			if(err ==null){
				res.send({code: code.RETURNCODE.OK});
			}
			else{
				res.send({code: code.RETURNCODE.ERROR,msg: err});
			}

	})


	/*
	//分配房间为大厅
	mysql.query('update Room set roomName=?, roomDescrib=?, userName=?, roomType=1 where roomType = 0 limit 1',
		[msg.hallName, msg.createHallDesc, msg.hallBoss], function (err, re) {
			console.log("test err===null : "+err);
			if (err === null) {
				if (re != null && re.length >= 1) {
					res.send({code: code.RETURNCODE.DBERROR, message: 'db error!'});
				}
				else{
					mysql.query('update User, room set user.roomID = room.roomID where user.userName = ? and room.userName = ?',[msg.hallBoss, msg.hallBoss],function(err,re2) {
						if (err === null) {
							if (re != null && re.length >= 1) {
								res.send({code: code.RETURNCODE.DBERROR, message: 'db error!'});
							}
							else
								res.send({code: code.RETURNCODE.OK, 'rooms': re});
						}
					});
				}
			}
			else {
				res.send({code: code.RETURNCODE.DBERROR, message: 'create hall update room error!'});}
		});
		*/
});

//删除大厅
app.post('/deleteHall', function(req, res) {
	var msg = req.body;
	var username = msg.username;
	var token = msg.token;
	var roomID = msg.roomID;
	if (Token.validate(token)!=0) {
		res.send({code: code.CODESTRING.DBERROR,DBERROR:'token error!'});
		return;
	}
	mysql.query('delete from Room where userName = ? or parent = ?',[username, roomID],function(err,re){
		if(err == null)
		{
			if(re!= null && re.length >=1)
			{
				res.send({code: code.RETURNCODE.OK, 'rooms': re});
			}
			else {
				res.send({code: code.CODESTRING.DBERROR, message: 'err find!'});
				console.log("err find!");
			}
		}
		else {
			console.log(err);
			res.send({code:code.CODESTRING.DBERROR,message:'access data erro'});
			console.log("access data erro");
		}

	});

});

//分配空房间为房间
app.post('/createRoom', function(req, res) {
	var msg = req.body;

	async.waterfall([
			function (callback) {
				mysql.query('select roomID,roomtype from Room where roomType = ? limit 1', [code.ROOMTYPE.EMPTY], function (err, res) {
					if (err == null) {
						if (res.length >= 1) {
							callback(null, res[0].roomID);
						}
						else {
							callback('No Room Available!')
						}

					}
					else {
						callback(err);
					}
				});
			},
			function (roomID, callback) {
				mysql.query('update Room set roomName=?, roomDescrib=?, parent=?, roomType=? where roomID = ?',
					[msg.roomName, msg.createRoomDesc, msg.roomID, msg.createRoomTypeToInt, roomID], function (err, re) {
						if (err == null) {
							callback(null);
						} else {
							callback(err);
						}
					});
			}
		],
		function (err, result) {
			if (err == null) {
				res.send({code: code.RETURNCODE.OK});
			}
			else {
				res.send({code: code.RETURNCODE.ERROR, msg: err});
			}

		}
	);
});




//Init mysql
mysql.init();

console.log("Web server has started.");
app.listen(8080);
