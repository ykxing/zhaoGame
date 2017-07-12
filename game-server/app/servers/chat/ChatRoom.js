/**
 * Created by xingyongkang on 2016/11/2.
 */
var code = require('../../../../shared/code');
var util = require('util');
var Room = require('./../../models/Room.js');
var callNetEasyApi = require('./../../util/netEasyApi');
//var mysql = require('../../models/dao/mysql/mysql');
// var finishPrinting = true;


var ChatRoom = function(app,opts) {
    Room.call(this,app,opts);
 };
util.inherits(ChatRoom, Room);

ChatRoom.prototype.tick = function(){
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
        switch(msg.command)
        {
            /*
            case code.COMMAND.HELLO:
                if(msg.username in this.users)
                {

                    this.users[msg.username][code.DATAINDEX.STATE] = 1;

                    this.sendMsg({command: code.COMMAND.HELLO, para: 1}, msg.username);
                }
                break;
            */
            case code.COMMAND.BCREQUESTFROMUSER:
                if(parseInt(this.roomInfo['parent']) >0) {
                    this.sendMsgToRoom({
                        'command': code.COMMAND.BCREQUESTFROMROOM,
                        'para': msg.para,
                        'userName': this.roomId
                    }, parseInt(this.roomInfo['parent']));

                }
                break;
            case code.COMMAND.BCREQUESTFROMHALL:
                var self = this;
                if(msg.para.toUser in this.users) {
                    console.log('charroom'+this.roomId+' Deal the remote message');
                    console.log(msg.para.command);
                    console.log(msg.para.para);
                    console.log(msg.para.fromUser);
                    console.log(msg.para.toUser);
                    switch (msg.para.command) {
                        case code.COMMAND.UPSCORE:
                        case code.COMMAND.DOWNSCORE:
                            this.users[msg.para.toUser][code.DATAINDEX.BALANCE] += parseInt(msg.para.para);
                            this.app.get('mysql').query("update User set balance = ?, waitBalance = ?   where userName = ?", [this.users[msg.para.toUser][code.DATAINDEX.BALANCE], 0,msg.para.toUser], function (err, data) {
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
                var self = this;
                this.app.get('mysql').query('select config from Room where roomID = ?', [this.roomId], function (err, res) {
                    if (err == null && res.length>=1) {
                        that.config = JSON.parse(res[0].config);
                        that.roomInfo['maxNumOfUser'] = that.config['maxNumOfUser'];
                        self.sendMsgToRoom({'command':code.COMMAND.ROOMNOTIFY,'para':self.roomInfo,'userName':self.roomId},self.roomInfo['parent']);
                    }
                    else {
                        console.log('ChatRoom Update Config Meet Error ' + err);
                    }
                });

                break;
            case code.COMMAND.LOGIN:
                    var self = this;
                    var username = msg.username;
                    this.app.get('mysql').query('select userID,userName, nick,userType,balance,parent from  User where userName = ?', [msg.username], function (err, res) {
                        if(err == null) {
                            if (!!res && res.length === 1) {
                                var rs = res[0];

                                self.users[username] = [0, 0, 0, 0,0,0,0,0,0,0,0];
                                self.users[username][code.DATAINDEX.USERID] = rs.userID;
                                self.users[username][code.DATAINDEX.BALANCE] = rs.balance;
                                self.users[username][code.DATAINDEX.USERTYPE] = rs.userType;
                                //self.users[username][code.DATAINDEX.BETSTART] = rs.nick;
                                //self.users[username][code.DATAINDEX.BETSTART+1] = rs.parent;
                                self.users[username][code.DATAINDEX.SWITCHUNIT] = 0;

                                self.users[username][code.DATAINDEX.STATE] = 1;
                                self.sendMsg({command: code.COMMAND.HELLO, para: 1}, username);

                                self.sendMsg({'command': code.COMMAND.SHOWUSERS, 'para': self.users}, '*');


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

                                self.sendMsgToRoom({'command':code.COMMAND.ROOMNOTIFY,'para':self.roomInfo,'userName':self.roomId},self.roomInfo['parent']);


                            }
                        }
                        else{
                            console.log("error happned in database!!!!:"+ err);
                        }
                    });

                //this.users[msg.username] = [0,0,0,0,0,0];
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

                this.sendMsgToRoom({'command':code.COMMAND.ROOMNOTIFY,'para':this.roomInfo,'userName':this.roomId},this.roomInfo['parent']);

                break;
            case code.COMMAND.SHOWROOMINFO:
                if(this.users[msg.username][code.DATAINDEX.STATE]>0) {
                    this.sendMsg({
                        command: code.COMMAND.SHOWROOMINFO,
                        para: this.roomInfo
                    }, msg.username);
                }
                break;
            case code.COMMAND.SHOWBETTING:
                if(this.users[msg.username][code.DATAINDEX.STATE]>0) {
                    this.sendMsg({
                        command: code.COMMAND.SHOWBETTING,
                        para: this.users[msg.username]
                    }, msg.username);
                }
                break;
            case code.COMMAND.SHOWALLBETTING:
                this.sendMsg({
                    command: code.COMMAND.SHOWALLBETTING,
                    para: this.allBetting
                }, '*');

                break;
            case code.COMMAND.SHOWSCENE:
                var nMsg = {command: code.COMMAND.SHOWSCENE, para: null};
                var nPara = {};
                nPara['sceTime'] = this.scene['sceTime'];
                nPara['sceNo'] = this.scene['sceNo'];
                nPara['curNo'] = this.scene['curNo'];
                for(var i = 0; i < this.scene['curNo']; i++){
                    nPara[i.toString()] = this.scene[i.toString()];
                }
                nMsg.para = nPara;
                this.sendMsg(nMsg, "*");
                break;
            case code.COMMAND.SHOWUSERS:
                this.sendMsg({'command': code.COMMAND.SHOWUSERS, 'para': this.users}, '*');
                break;

            case code.COMMAND.OPERATE:
                if(msg.username in this.users) {
                    if(msg.username == this.man)
                    {

                    }
                    else {
                        switch(msg.para)
                        {
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                                if (this.state == code.STATE.BETTING) {
                                    unit = this.users[msg.username][code.DATAINDEX.SWITCHUNIT];
                                    if(this.users[msg.username][code.DATAINDEX.BALANCE] < unit)
                                        unit = this.users[msg.username][code.DATAINDEX.BALANCE];
                                    if(msg.para == 4)
                                        var limit = this.config.limitScoreOfKing;
                                    else
                                        var limit = this.config.limitScoreOfOthers;
                                    if((this.users[msg.username][code.DATAINDEX.BETSTART+(msg.para % 5)] + unit) <= limit) {
                                        this.users[msg.username][code.DATAINDEX.BETSTART + (msg.para % 5)] += unit;
                                        this.users[msg.username][code.DATAINDEX.BALANCE] -= unit;
                                        this.allBetting[msg.para % 5] += unit;
                                        this.addMsg({
                                            command: code.COMMAND.SHOWBETTING,
                                            username: msg.username,
                                            para: 0
                                        });
                                        this.addMsg({
                                            command: code.COMMAND.SHOWALLBETTING,
                                            username: msg.username,
                                            para: 0
                                        });
                                    }
                                    else{

                                    }

                                }
                                break;
                            case 5:
                                var switchScore = this.config.switchString.split('-');
                                console.log(switchScore);
                                var j = -1;
                                for(var i = 0; i<switchScore.length; i++){
                                    if(parseInt(switchScore[i]) == this.users[msg.username][code.DATAINDEX.SWITCHUNIT]){
                                        j = (i+1)%switchScore.length;
                                        this.users[msg.username][code.DATAINDEX.SWITCHUNIT] = parseInt(switchScore[j]);
                                        break;
                                    }
                                }
                                if(j == -1)
                                    this.users[msg.username][code.DATAINDEX.SWITCHUNIT] = parseInt(switchScore[0]);

                                this.addMsg({command: code.COMMAND.SHOWBETTING, username: msg.username, para: 0});
                                break;

                        }

                    }
                }
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

            case code.COMMAND.FINISHPRINTING:
                console.log('chatroom finish printing i am='+this.roomId);
                this.printingState = true;
                break;
            case code.COMMAND.CHECKPRINTER:

                if(this.printerState == false)
                {
                    if(msg.para == 1) {
                        this.printerState = true;
                        console.log('printState='+this.printerState);
                    }
                }
                else{
                    if(msg.para == 0) {
                        this.printerState = false;
                        console.log('printState=' + this.printerState);
                    }
                }

                break;
           default:
                //this.msgQueue.push(msg);
                //this.notice(msg.command);
                break;
        }

    }

    switch(this.state) {
        case code.STATE.GENERATESCENE:
            if (this.bIfJustIn) {

                this.sendMsg({command: code.COMMAND.CHANGESTATE, para: code.STATE.GENERATESCENE}, '*');
                var rate = [0.23, 0.23, 0.22, 0.22, 0.10];

                var curTime = new Date();
                var sceTime = new Date(this.config.sceTime);
                var a = curTime.getDate()- sceTime.getDate();
                if(a == 0)
                    this.scene['sceNo'] = parseInt(this.config.sceNo) + 1;
                else
                    this.scene['sceNo'] = 1;
                this.scene['sceTime'] = (new Date()).toLocaleString();

                this.config.sceNo = this.scene['sceNo'];
                this.config.sceTime = this.scene['sceTime']

                var sconfig = JSON.stringify(this.config);
                this.app.get('mysql').query('update Room set config = ? where roomID = ?',[sconfig,this.roomId],function(err,data) {
                    if (err == null) {


                    }
                    else {
                        console.log(err);
                    }
                });
                this.scene['curNo'] = -1;
                for (var i = 0; i < 100; i++) {
                    this.scene[i] = this.sampling(rate);
                }
                this.printingState = true;

                this.bIfJustIn = false;
            }
            else {

                if(this.printingState == true){
                    this.changeState(code.STATE.STARTBETTING);
                }
                else{
                    if (this.myTimer >= 10){
                        this.myTimer = 0;
                        //PRINTER SCENE
                        console.log('正在请求打印路单');
                        this.showMsg('正在请求打印路单');
                        var nPara = {};
                        nPara['sceTime'] = this.scene['sceTime'];
                        nPara['sceNo'] = this.scene['sceNo'];
                        nPara['curNo'] = this.scene['curNo'];
                        nPara['roomName'] = this.roomInfo['roomName'] ;
                        nPara['roomID'] = this.roomInfo['roomID'] ;
                        nPara['roomType'] = this.roomInfo['roomType'];
                        for (var i = 0; i < 100; i++) {
                            nPara[i.toString()] = this.scene[i.toString()];
                        }
                        //nMsg.para = nPara;
                        //this.sendMsg(nMsg, "*");
                        this.sendMsgToRoom({
                            'command': code.COMMAND.PRINTSCENE,
                            'para':nPara ,
                            'userName': this.roomId
                        }, this.roomInfo['parent']);
                        ///

                    }
                }
                }
            break;
        case code.STATE.INIT:
            if (this.bIfJustIn) {
                //this.sendMsg({command: code.COMMAND.CHANGESTATE, para: code.STATE.INIT},'*');
                var that = this;
                this.bIfJustIn = false;
                this.app.get('mysql').query('select roomID,roomName,roomDescrib,roomType,parent,config from Room where roomID = ?', [this.roomId], function (err, res) {
                    if (err == null) {
                        if (!!res && res.length >= 1) {
                            var rs = res[0];
                            that.roomInfo['roomID'] = rs.roomID;
                            that.roomInfo['roomName'] = rs.roomName;
                            that.roomInfo['roomDescrib'] = rs.roomDescrib;
                            that.roomInfo['parent'] = rs.parent;
                            that.roomInfo['roomType'] = rs.roomType;
                            that.roomInfo['numOfUsers'] = 0;

                            if (rs.config == undefined ||rs.config == null || rs.config=="") {
                                console.log('init config...');
                                var nconfig = {
                                    'sceNo': 1,
                                    'sceTime': (new Date()).toString(),
                                    'maxNumOfUser': 8,
                                    'limitScoreOfOthers': 1000,
                                    'limitScoreOfKing': 100,
                                    'switchString': '10-50-100'
                                }
                                var sconfig = JSON.stringify(nconfig);
                                that.config = JSON.parse(sconfig);

                                that.app.get('mysql').query('update Room set config = ? where roomID = ?', [sconfig, that.roomId], function (err, data) {
                                        if (err == null) {


                                        }
                                        else {
                                            console.log(err);
                                        }
                                    }
                                );

                                that.roomInfo['maxNumOfUser'] = that.config['maxNumOfUser'];
                                console.log('maxNumOfUser=' + that.roomInfo['maxNumOfUser'] + '=' + that.config['maxNumOfUser']);
                            }
                            else {
                                that.config = JSON.parse(rs.config);
                                that.roomInfo['maxNumOfUser'] = that.config['maxNumOfUser'];
                            }

                        }
                    }
                });
                this.scene['sceTime'] = (new Date()).toString();
                this.scene['curNo'] = 99;
                for (var i = 0; i < 100; i++) {
                    this.scene[i] = 4;
                }

            }
            else {
                if (this.myTimer >= 10) {
                    this.sendMsgToRoom({
                        'command': code.COMMAND.ROOMNOTIFY,
                        'para': this.roomInfo,
                        'userName': this.roomId
                    }, this.roomInfo['parent']);
                    if (this.printerState == true)
                        this.changeState(code.STATE.GENERATESCENE);
                }
            }
            break;
        case code.STATE.STARTBETTING:
            if (this.bIfJustIn) {

                this.scene['curNo'] = this.scene['curNo'] + 1;
                if (this.scene['curNo'] >= 5  || this.printerState == false) {
                    this.changeState(code.STATE.CHECKSCENE);
                    //this.sendMsg({command: code.COMMAND.UNLOCK, para: ''}, '*');
                    this.sendMsgToRoom({'command':code.COMMAND.UNLOCK,'para':0,'userName':this.roomId},this.roomInfo['parent']);
                    return;
                }
                this.addMsg({command: code.COMMAND.SHOWSCENE, username: 'system', para: 0});


                this.sendMsg({command: code.COMMAND.CHANGESTATE, para: code.STATE.STARTBETTING}, '*');


                //send Scene to Hall
                var nPara = {};
                nPara['sceTime'] = this.scene['sceTime'];
                nPara['sceNo'] = this.scene['sceNo'];
                nPara['curNo'] = this.scene['curNo'];
                for(var i = 0; i < this.scene['curNo']; i++){
                    nPara[i.toString()] = this.scene[i.toString()];
                }
                this.sendMsgToRoom({'command':code.COMMAND.SCENENOTIFY,'para':nPara,'userName':this.roomId},this.roomInfo['parent']);

                this.bIfJustIn = false;

            }
            else {

                if (this.myTimer >= 10) {
                    this.changeState(code.STATE.BETTING);

                }
            }
            break;

        case code.STATE.BETTING:
            if (this.bIfJustIn) {
                this.sendMsg({command: code.COMMAND.CHANGESTATE, para: code.STATE.BETTING}, '*');
                this.bIfJustIn = false;
                this.clock = 10;


            }
            else {
                if (this.myTimer % 10 == 0) {
                    this.clock -= 1;
                    this.sendMsg({command: code.COMMAND.SHOWTIME, para: this.clock}, '*');
                }
                if (this.myTimer >= 100) {
                    this.changeState(code.STATE.STOPBETTING);

                }
            }
            break;

        case code.STATE.STOPBETTING:
            if (this.bIfJustIn) {
                this.sendMsg({command: code.COMMAND.CHANGESTATE, para: code.STATE.STOPBETTING}, '*');
                this.bIfJustIn = false;

            }
            else {
                if (this.myTimer >= 20) {
                    this.changeState(code.STATE.ANOUNCERESULT);

                }
            }
            break;
        case code.STATE.ANOUNCERESULT:
            var that = this;
            if (this.bIfJustIn) {
                var i = this.scene['curNo'];
                var tColor = this.scene[i];
                var cardNo;
                if (tColor == 4)
                    cardNo = 4 * 13 + Math.round(Math.random() * 1);
                else
                    cardNo = tColor * 13 + Math.round(Math.random() * 12);


                var nPara = {winColor: cardNo, winScore: 0, winBonus: 0};
                var winRate = [3.8, 3.8, 4.0, 4.0, 20];
                for (var prop in this.users) {
                    var betScore = 0;
                    var winScore = 0;
                    if (prop == this.man)
                        continue;
                    if (tColor == 4) {
                        for (i = 0; i < 5; i++) {
                            betScore += this.users[prop][code.DATAINDEX.BETSTART + i];
                            if (i == tColor)
                                this.users[prop][code.DATAINDEX.BETSTART + i] = Math.round(this.users[prop][code.DATAINDEX.BETSTART + i] * winRate[i]);
                            this.users[prop][code.DATAINDEX.BALANCE] += this.users[prop][code.DATAINDEX.BETSTART + i];
                            winScore += this.users[prop][code.DATAINDEX.BETSTART + i];
                        }
                    }
                    else {
                        for (i = 0; i < 5; i++) {
                            betScore += this.users[prop][code.DATAINDEX.BETSTART + i];
                            if (i != tColor)
                                this.users[prop][code.DATAINDEX.BETSTART + i] = 0;
                            else
                                this.users[prop][code.DATAINDEX.BETSTART + i] = Math.round(this.users[prop][code.DATAINDEX.BETSTART + i] * winRate[i]);
                            this.users[prop][code.DATAINDEX.BALANCE] += this.users[prop][code.DATAINDEX.BETSTART + i];
                            winScore += this.users[prop][code.DATAINDEX.BETSTART + i];
                        }
                    }
                    if (betScore > 0) {
                        this.app.get('mysql').query("update User set balance = ?  where userName = ?", [this.users[prop][code.DATAINDEX.BALANCE], prop], function (err, data) {
                        });

                        this.app.get('mysql').query('CALL betToAccount(?,?,?,?,?)',[this.users[prop][code.DATAINDEX.USERID],1,betScore,winScore,this.roomId], function(err, rows ) {
                            if (err == null) {
                                console.log('call OK');
                                console.log(rows);

                            }
                            else{
                                console.log(err);
                            }

                        });
                    }
                    if (betScore > 0) {
                        this.addAccount(this.users[prop][code.DATAINDEX.USERID],code.OPERATIONTYPE.BET,betScore,this.roomId);
                        /*
                        this.app.get('mysql').query('update Account set score = score + ? where userID = ? && operation = ? && DAYOFYEAR(NOW()) = DAYOFYEAR(time)',
                            [betScore,this.users[prop][code.DATAINDEX.USERID], code.OPERATIONTYPE.BET], function (err, res) {
                                if (err == null  ) {
                                    if(res.affectedRows == 0){
                                        console.log('cant find new rows');
                                        that.app.get('mysql').query('insert into Account (userID,operation,score,target) values (?,?,?,?)',
                                            [that.users[prop][code.DATAINDEX.USERID], code.OPERATIONTYPE.BET, betScore, that.roomId,""], function (err, res) {
                                                if (err != null) {
                                                    console.log(err);
                                                } else {

                                                }
                                            });

                                    }
                                } else {
                                    console.log(err);
                                }
                            });
                           */
                        /*
                        this.app.get('mysql').query('insert into Account (userID,operation,score,target) values (?,?,?,?)',
                            [this.users[prop][code.DATAINDEX.USERID], code.OPERATIONTYPE.BET, betScore, this.roomId,""], function (err, res) {
                                if (err != null) {
                                    console.log(err);
                                } else {

                                }
                            });
                            */
                    }
                    if (winScore > 0) {
                        this.addAccount(this.users[prop][code.DATAINDEX.USERID],code.OPERATIONTYPE.WIN,winScore,this.roomId);
                        /*
                        this.app.get('mysql').query('insert into Account (userID,operation,score,target) values (?,?,?,?)',
                            [this.users[prop][code.DATAINDEX.USERID], code.OPERATIONTYPE.WIN, winScore, this.roomId,""], function (err, res) {
                                if (err != null) {
                                    console.log(err);
                                } else {

                                }
                            });
                            */
                    }

                }
                this.sendMsg({command: code.COMMAND.SHOWRESULT, para: nPara}, '*');
                this.bIfJustIn = false;

            }
            else {
                if (this.myTimer >= 30) {
                    this.changeState(code.STATE.CELEBRATE);

                }
            }
            break;
        case code.STATE.CELEBRATE:
            if (this.bIfJustIn) {
                this.sendMsg({command: code.COMMAND.CHANGESTATE, para: code.STATE.CELEBRATE}, '*');
                for (var prop in this.users) {
                    if (prop == this.man)
                        continue;
                    this.addMsg({command: code.COMMAND.SHOWBETTING, username: prop, para: 0});
                    //this.sendMsg({command: code.COMMAND.SHOWBETTING, para: this.users[prop]},prop);
                }
                this.bIfJustIn = false;
            }
            else {
                if (this.myTimer >= 30) {
                    this.changeState(code.STATE.CLEAR);

                }
            }
            break;
        case code.STATE.CLEAR:
            if (this.bIfJustIn) {
                this.sendMsg({command: code.COMMAND.CHANGESTATE, para: code.STATE.CLEAR}, '*');

                for (var i = 0; i < this.allBetting.length - 1; i++) {
                    this.allBetting[i] = 0;
                }

                for (var prop in this.users) {
                    for (var i = code.DATAINDEX.BETSTART; i < 11; i++) {
                        this.users[prop][i] = 0;
                    }
                    this.addMsg({command: code.COMMAND.SHOWBETTING, username: prop, para: 0});
                    //this.sendMsg({command: code.COMMAND.SHOWBETTING,para:this.users[pop]},pop);
                }
                //this.addMsg({command: code.COMMAND.SHOWUSERS, username: this.man, para: 0});
                this.addMsg({command: code.COMMAND.SHOWALLBETTING, username: 'system', para: 0});
                //this.sendMsg({command: code.COMMAND.SHOWALLBETTING,para:this.allBetting},'*');
                this.bIfJustIn = false;

            }
            else {


                if (this.myTimer >= 10) {
                    this.changeState(code.STATE.STARTBETTING);

                }
            }
            break;
        case code.STATE.CHECKSCENE:
            if (this.bIfJustIn) {

                this.sendMsg({command: code.COMMAND.CHANGESTATE, para: code.STATE.CHECKSCENE}, '*');
                this.scene['curNo'] = 100;
                this.addMsg({command: code.COMMAND.SHOWSCENE, username: 'system', para: 0});

                this.bIfJustIn = false;
                this.clock = 30;
            }
            else {
                if (this.myTimer % 10 == 0) {
                    //this.clock -= 1;
                    //this.sendMsg({command: code.COMMAND.SHOWTIME, para: this.clock}, '*');
                    this.showMsg('请您对单');
                }
                if (this.myTimer >= 300) {
                    if(this.printerState == true) {
                        this.changeState(code.STATE.GENERATESCENE);
                    }

                }
            }
            break;
    }

    if(this.printerState == false &&!(this.state == code.STATE.INIT || this.state == code.STATE.CHECKSCENE)){
        this.changeState(code.STATE.CHECKSCENE);
    }
};

module.exports = ChatRoom;