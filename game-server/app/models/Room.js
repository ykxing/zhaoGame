/**
 * Created by xingyongkang on 2016/10/24.
 */
//var pomelo = require('pomelo');
var code = require('../../../shared/code.js');
var Room = function(app,opts){
    this.app = app;
    this.roomId = opts.roomId;
    this.name = opts.name;
    this.users = {};
    this.channel = null;
    this.msgQueue = [];
    this.state = code.STATE.INIT;
    this.bIfJustIn = true;
    this.myTimer = 0;
    this.clock = 1;
    this.allBetting = [0,0,0,0,0,0];
    this.scene = {};
    this.man = '';
    this.printerState = true;
    this.printingState = true;
    this.config = '';
    this.roomInfo = {};

    console.log('hawk:call get chanlee');
    this.getChannel();

};
Room.prototype.sendMsgToRoom = function(msg,toRoomID){
    //this.app.rpc.chat.chatRemote.notifyToRoom(toRoomID,{'command':code.COMMAND.ROOMNOTIFY,'para':{'roomName':'room1','roomType':2,'roomID':this.parent},'userName':this.roomId},function(){});
    this.app.rpc.chat.chatRemote.notifyToRoom(toRoomID,toRoomID,msg,function(){});//notice the first para is used for router

}
Room.prototype.sendMsg = function(msg,toUser)
{
    var param = {
        route: 'onServer',
        msg: msg,
        from: "Server",
        target: toUser
    };
    if(! this.channel) {
        //this.channel = this.app.get('channelService').getChannel(this.roomId, true);
        this.channel = this.getChannel();
        console.log('hawk: find the channel is null and roomID= '+this.roomId);
    }

    //the target is all users
    if(toUser == '*') {
        this.channel.pushMessage(param);
    }
    //the target is specific user
    else {
        var channelService = this.app.get('channelService');
        var tuid = toUser;
        var ttuid = this.channel.getMember(tuid);
        if(ttuid != null) {
            //var tsid = this.channel.getMember(tuid)['sid'];
            var tsid = ttuid['sid'];
            channelService.pushMessageByUids(param, [{
                uid: tuid,
                sid: tsid
            }]);
        }
        else{
            console.log('hawk:::tuid is null!!!!');
        }

    }
    /*
    var param = {
        route: 'onServer',
        msg: msg,
        from: "Server",
        target: toUser
    };
    if(! this.channel) {
        this.channel = this.app.get('channelService').getChannel(this.roomId, true);
        console.log('hawk: roomID= '+this.roomId);
    }

   // this.notice(msg);
    //the target is all users
    if(toUser == '*') {
        this.channel.pushMessage(param);
    }
    //the target is specific user
    else {
        var channelService = this.app.get('channelService');
        //var tuid = msg.target + '*' + rid;
        //var tuid = toUser  + '*' + this.roomId;
        var tuid = toUser;
        var ttuid = this.channel.getMember(tuid);
        if(ttuid != null) {
            //var tsid = this.channel.getMember(tuid)['sid'];
            var tsid = ttuid['sid'];
            channelService.pushMessageByUids(param, [{
                uid: tuid,
                sid: tsid
            }]);
        }
        else{
            console.log('hawk:::tuid is null!!!!');
        }

    }
    */
    //this.notice(msg.command+":"+ msg.para);
}


Room.prototype.showMsg = function(msg){
    this.sendMsg({command:code.COMMAND.SHOWMESSAGE,para:msg},'*');
}

Room.prototype.changeState = function(nextState){
    this.state = nextState;
    this.bIfJustIn = true;
    this.myTimer = 0;

};
Room.prototype.addMsg = function(msg){
    this.msgQueue.push(msg);
};
Room.prototype.notice = function(msg){
    var userList = "";
    for(var pop in this.users){
        if(typeof(pop) != "function")
        {
            userList += pop+" ";
            userList += this.users[pop].toString()+"\n";
        }
    }
  console.log('\n'+this.name+':'+this.man+':\n'+userList+"\n"+msg);
};

Room.prototype.getChannel= function() {
    if(this.channel) {
        return this.channel;
    }
    this.channel = this.app.get('channelService').getChannel(this.roomId, true);
   // console.log('hawk:........get channel name='+this.roomId);
   // console.log(this.channel);
    return this.channel;
    /*
    var channelService = this.app.get('channelService');
    var channel = channelService.getChannel(roomID, true);
    return this.channel;
    */
};

Room.prototype.sampling = function(prate){
    var rate = [];
    for(var i = 0; i< prate.length; i++)
    rate.push(prate[i]);

    for(var i = 1; i<rate.length;i++)
       rate[i] =  rate[i] + rate[i-1];
    var rand = Math.random();

    for(var i = 0; i<rate.length; i++)
    {
        if( i== 0){
            if(rand < rate[i])
            {
                return i;
            }
        }
        else
        {
            if(rand >= rate[i-1] && rand < rate[i])
            {
                return i;
            }
        }


    }
};


Room.prototype.tick = function(){
    var roomId = this.roomId;
    console.info(this.name + roomId);
    while(true)
    {
        var msg = this.msgQueue.shift();
        if(msg != null)
        {
            console.log(msg);
        }
        else
        {
            break;
        }
    }
};

Room.prototype.run = function () {
    this.interval = setInterval(this.tick.bind(this),100);
};


Room.prototype.util = {
    urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
    //  html sanitizer
    toStaticHTML: function(inputHtml) {
        inputHtml = inputHtml.toString();
        return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    //pads n with zeros on the left,
    //digits is minimum length of output
    //zeroPad(3, 5); returns "005"
    //zeroPad(2, 500); returns "500"
    zeroPad: function(digits, n) {
        n = n.toString();
        while(n.length < digits)
            n = '0' + n;
        return n;
    },
    spacePad: function(digits, n) {
        n = n.toString();
        while(n.length < digits)
            n =  n + ' ';
        return n;
    },
    //it is almost 8 o'clock PM here
    //timeString(new Date); returns "19:49"
    timeString: function(date) {
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
    },

    //it is almost 8 o'clock PM here
    //timeString(new Date); returns "19:49"
    dateString: function(date) {
        var year = date.getFullYear().toString();
        var month = (date.getMonth()+1).toString();
        var day = (date.getDay()+1).toString();
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        var seconds = date.getSeconds().toString();
        return this.zeroPad(4, year)+"-"+this.zeroPad(2, month)+"-"+this.zeroPad(2, day)+" "+this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes)+  ":" + this.zeroPad(2, seconds);
    },

    //it is almost 8 o'clock PM here
    //timeString(new Date); returns "19:49"
    dateNoString: function(date) {
        var year = date.getFullYear().toString();
        var month = (date.getMonth()+1).toString();
        var day = (date.getDay()+1).toString();
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        var seconds = date.getSeconds().toString();
        return this.zeroPad(4, year)+this.zeroPad(2, month)+this.zeroPad(2, day)+this.zeroPad(2, hours) + this.zeroPad(2, minutes)+ this.zeroPad(2, seconds);
    },
    //does the argument only contain whitespace?
    isBlank: function(text) {
        var blank = /^\s*$/;
        return(text.match(blank) !== null);
    }
};

Room.prototype.addAccount = function(userID,operation,score,roomID){
    var that = this;
    this.app.get('mysql').query('update Account set score = score + ? where userID = ? && operation = ? && DAYOFYEAR(NOW()) = DAYOFYEAR(time)',
        [score,userID, operation], function (err, res) {
            if (err == null  ) {
                if(res.affectedRows == 0){
                    console.log('cant find new rows');
                    that.app.get('mysql').query('insert into Account (userID,operation,score,target) values (?,?,?,?)',
                        [userID,operation,score,roomID], function (err, res) {
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

};

module.exports = Room;
