/**
 * Created by xingyongkang on 2017/2/23.
 */
/**
 * Created by xingyongkang on 2016/11/2.
 */
var code = require('../../../../shared/code');
var util = require('util');
var Room = require('./../../models/Room.js');
var callNetEasyApi = require('./../../util/netEasyApi');
//var mysql = require('../../models/dao/mysql/mysql');

var HallRoom = function(app,opts) {
    Room.call(this,app,opts);
    this.rooms = {};
    this.scenes ={};
};
util.inherits(HallRoom, Room);

HallRoom.prototype.tick = function(){
    var roomId = this.roomId;
    this.myTimer = this.myTimer + 1;
    var that = this;

    //var msgQueueLength = this.msgQueue.length;
    //for(var i = 0 ; i< msgQueueLength; i++)
    while(true)
    {
        var msg = this.msgQueue.shift();
        if(msg == undefined) {
            //this.notice("it really happened ");
            break;
        }

        //this.notice(msg);
        switch(msg.command) {
            /*
            case code.COMMAND.HELLO:
                if (msg.username in this.users) {
                    this.users[msg.username][code.DATAINDEX.STATE] = 1;
                    this.sendMsg({command: code.COMMAND.HELLO, para: 1}, msg.username);
                }
                break;
            */
            case code.COMMAND.BCREQUESTFROMUSER:
            case code.COMMAND.BCREQUESTFROMROOM:
                var self = this;
                for (var sroom in this.rooms) {
                    this.sendMsgToRoom({
                        'command': code.COMMAND.BCREQUESTFROMHALL,
                        'para': msg.para,
                        'userName': this.roomId
                    }, parseInt(sroom));

                }

                if(msg.para.toUser in this.users) {
                    console.log('hallroom '+this.roomId+' Deal the remote message');
                    console.log(msg.para.command);
                    console.log(msg.para.para);
                    console.log(msg.para.fromUser);
                    console.log(msg.para.toUser);
                    switch (msg.para.command) {
                        case code.COMMAND.USERREQESTDOWNSCORE:
                            self.sendMsg({
                                command: code.COMMAND.USERREQESTDOWNSCORE,
                                para: {userName:msg.para.fromUser, score: msg.para.para}
                            }, msg.para.toUser);

                            break;
                        case code.COMMAND.UPSCORE:
                        case code.COMMAND.DOWNSCORE:
                            this.users[msg.para.toUser][code.DATAINDEX.BALANCE] += parseInt(msg.para.para);
                            this.app.get('mysql').query("update User set balance = ?, waitBalance = ?   where userName = ?", [this.users[msg.para.toUser][code.DATAINDEX.BALANCE], 0, msg.para.toUser], function (err, data) {
                                if (err == null) {

                                }
                                else {
                                    console.log(err);
                                }
                            });
                            if(msg.para.command == code.COMMAND.UPSCORE) {
                                self.sendMsg({
                                    'command': code.COMMAND.UPSCORE,
                                    'para': msg.para.fromUser + '给你上分:' + msg.para.para
                                }, msg.para.toUser);
                            }
                            else {
                                self.sendMsg({
                                    'command': code.COMMAND.UPSCORE,
                                    'para': msg.para.fromUser + '给你下分:' + Math.abs(msg.para.para)
                                }, msg.para.toUser);
                            }

                            self.sendMsg({
                                command: code.COMMAND.SHOWBETTING,
                                para: self.users[msg.para.toUser]
                            }, msg.para.toUser);

                            break;
                        default:
                            break;
                    }
                }
                 break;
            case code.COMMAND.UPDATEROOMCONFIG:
                if(msg.para in this.rooms) {
                    this.sendMsgToRoom({
                        'command': code.COMMAND.UPDATEROOMCONFIG,
                        'para': msg.para,
                        'userName': this.roomId
                    }, parseInt(msg.para));

                }
                break;
            case code.COMMAND.ROOMNOTIFY:
                this.rooms[msg.userName] = msg.para;
                this.sendMsg({command: code.COMMAND.SHOWROOMS, para: this.rooms}, "*");
                break;
            case code.COMMAND.SCENENOTIFY:
                this.scenes[msg.userName] = msg.para;
                this.sendMsg({command: code.COMMAND.SHOWSCENES, para: this.scenes}, "*");
                break;
            case code.COMMAND.SHOWSCENES:
                this.sendMsg({command: code.COMMAND.SHOWSCENES, para: this.scenes},msg.username);
                break;
            case code.COMMAND.LOGIN:
                var self = this;
                var username = msg.username;
                this.app.get('mysql').query('select userName, nick,userType,balance,parent from  User where userName = ?', [msg.username], function (err, res) {
                    if(err == null) {
                        if (!!res && res.length === 1) {
                            var rs = res[0];
                            self.users[username] = [0, 0, 0, 0,0,0,0,0,0,0,0];
                            self.users[username][code.DATAINDEX.BALANCE] = rs.balance;
                            self.users[username][code.DATAINDEX.USERTYPE] = rs.userType;

                            self.users[username][code.DATAINDEX.STATE] = 1;
                            self.sendMsg({command: code.COMMAND.HELLO, para: 1}, username);

                            self.sendMsg({'command': code.COMMAND.SHOWUSERS, 'para': self.users}, '*');
                            switch(self.users[username][code.DATAINDEX.USERTYPE]){
                                case code.USERTYPE.CHATROOMPRINTER:
                                    console.log('change switchunit here specaill for printer state');
                                    self.users[username][code.DATAINDEX.BALANCE] = 0;
                                    self.users[username][code.DATAINDEX.SWITCHUNIT] = 1;
                                    console.log('change switchunit here'+ self.users[username][code.DATAINDEX.SWITCHUNIT] );
                                    self.users[username][code.DATAINDEX.BONUS] = code.ROOMTYPE.CHATROOM;
                                    break;
                                default:
                                    break;
                            }
                            //updte room state
                            var count = 0;
                            for (var i in self.users){
                                if (self.users.hasOwnProperty(i)) {
                                    count ++;
                                }
                            }
                            self.roomInfo['numOfUsers'] = count;
                            self.sendMsg({
                                command: code.COMMAND.SHOWROOMINFO,
                                para: self.roomInfo
                            }, '*');
                        }
                    }
                    else{
                        console.log("error happned in database!!!!:"+ err);
                    }
                });
                 break;
            case code.COMMAND.LOGOUT:

                delete this.users[msg.username];

                this.sendMsg({'command': code.COMMAND.SHOWUSERS, 'para': this.users}, '*');

                //updte room state
                var count = 0;
                for (var i in this.users){
                    if (this.users.hasOwnProperty(i)) {
                        count ++;
                    }
                }
                this.roomInfo['numOfUsers'] = count;

                this.sendMsg({
                    command: code.COMMAND.SHOWROOMINFO,
                    para: this.roomInfo
                }, '*');
                break;

            case code.COMMAND.SHOWROOMS:
                if(this.users[msg.username][code.DATAINDEX.STATE]>0) {
                    this.sendMsg({
                        command: code.COMMAND.SHOWROOMS,
                        para: this.rooms
                    }, msg.username);
                }
                break;
            case code.COMMAND.SHOWROOMINFO:
                if(this.users[msg.username][code.DATAINDEX.STATE]>0) {
                    this.sendMsg({
                        command: code.COMMAND.SHOWROOMINFO,
                        para: this.roomInfo
                    }, msg.username);
                }
                break;

            case code.COMMAND.SHOWUSERS:
                this.sendMsg({'command': code.COMMAND.SHOWUSERS, 'para': this.users}, '*');
                //this.sendMsg(nMsg, msg.username);
                break;

            case code.COMMAND.CHAT:
                var tu = "*"
                if(msg.para.to != '*')
                    tu = msg.para.to;
                this.sendMsg({
                    command: code.COMMAND.CHAT,
                    para: {message:msg.para.mes,from: msg.username}
                }, tu);
                break;

            case code.COMMAND.UNLOCK:
                console.log('unLock');
                //this.sendMsg({command: code.COMMAND.UNLOCK, para: ''}, "*");

                break;
            case code.COMMAND.FINISHPRINTING:
                console.log('hall finish printing message and roomId='+msg.para);
                if (msg.username in this.users) {
                    this.users[msg.username][code.DATAINDEX.SWITCHUNIT] = 1;
                        if (this.rooms[msg.para]['roomType'] == this.users[msg.username][code.DATAINDEX.BONUS]) {
                                this.sendMsgToRoom({
                                    'command': code.COMMAND.FINISHPRINTING,
                                    'para': 1,
                                    'userName': this.roomId
                                }, parseInt(msg.para));
                            }
                        }
                break;
            case code.COMMAND.CHECKPRINTER:
                //balance: door state(1 close) (0 open); switchunit: printing(1) or wait(0)
                if (msg.username in this.users) {
                    if (this.users[msg.username][code.DATAINDEX.BALANCE] != parseInt(msg.para)) {
                        this.users[msg.username][code.DATAINDEX.BALANCE] = parseInt(msg.para);
                        for (var sroom in this.rooms) {
                            if (this.rooms[sroom]['roomType'] == this.users[msg.username][code.DATAINDEX.BONUS]) {
                                this.sendMsgToRoom({
                                    'command': code.COMMAND.CHECKPRINTER,
                                    'para': parseInt(msg.para),
                                    'userName': this.roomId
                                }, parseInt(sroom));
                            }
                        }
                    }

                }
                break;
            case code.COMMAND.PRINTSCENE:
               for (var user in this.users) {
                    if ((this.users[user][code.DATAINDEX.BALANCE]==1) && (this.rooms[msg.userName]['roomType'] == this.users[user][code.DATAINDEX.BONUS])) {
                        this.showMsg('request to ' + user);
                        if(this.users[user][code.DATAINDEX.SWITCHUNIT] == 1) {
                            this.users[user][code.DATAINDEX.SWITCHUNIT] = 0;
                            this.sendMsg({
                                'command': code.COMMAND.PRINTSCENE,
                                'para': msg.para
                            }, user);
                            break;
                        }

                    }
                }
                break;
            default:
                //this.msgQueue.push(msg);
                //this.notice(msg.command);
                break;
        }

    }

    switch(this.state)
    {
        case code.STATE.INIT:
            if(this.bIfJustIn)
            {
                var that = this;
                this.bIfJustIn = false;
                this.app.get('mysql').query('select roomID,roomName,roomDescrib,roomType,parent from Room where roomID = ?', [this.roomId], function (err, res) {
                    if (err == null) {
                        if (!!res && res.length >= 1) {
                            var rs = res[0];
                            that.roomInfo['roomID'] = rs.roomID;
                            that.roomInfo['roomName'] = rs.roomName;
                            that.roomInfo['roomDescrib'] = rs.roomDescrib;
                            that.roomInfo['parent'] = rs.parent;
                            that.roomInfo['roomType'] = rs.roomType;
                            that.roomInfo['numOfUsers'] = 0;

                        }
                    }
                });
            }
            else {
                if (this.myTimer >= 10) {
                    this.changeState(code.STATE.WAIT);

                }
            }
            break;
        case code.STATE.WAIT:
            if(this.bIfJustIn){

                this.bIfJustIn = false;
            }
            else {

            }
            break;

    }
};

module.exports = HallRoom;