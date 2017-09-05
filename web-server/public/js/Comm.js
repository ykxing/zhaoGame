    /**
     * Created by xingyongkang on 17/7/26.
     */
     var Comm = function() {

        this.state = {connect:false, inroom: false};
        this.pomelo = window.pomelo;
        this.msgQueue = [];
        this.pomelo.on('onServer', this.receiveMsg(data));
    }

                Comm.prototype.receiveMsg = function(data){
                    if (data.msg != undefined) {
                        this.msgQueue.push(data.msg);
                        console.log(data.msg);
                    }
                    else{
                        console.log(data);
                    }
                };
                Comm.prototype.getMessage  = function(){
                    var msg = this.msgQueue.shift();
                    return msg;
                    //if(msg == undefined)
                    //    break;
                }

                Comm.prototype.sendMsgb = function(msg) {
                        var route = "chat.chatHandler.send";
                        this.pomelo.request(route, msg, function (data) {

                        });
                    };

                Comm.prototype.sendMessageToUser = function(msg, toUser) {
                        var route = "chat.chatHandler.send";
                        var tmsg = {'command':code.COMMAND.BCREQUESTFROMUSER, 'para':msg};
                        this.pomelo.request(route, tmsg, function (data) {

                        });

                    };

                Comm.prototype.login = function(username, roomID, myToken) {
                    queryEntry(username, function (host, port) {
                        pomelo.init({
                            host: host,
                            port: port,
                            log: true
                        }, function () {
                            var route = "sioconnector.entryHandler.enter";
                            pomelo.request(route, {
                                username: username,
                                rid: roomID,
                                token: myToken
                            }, function (data) {
                                if (data.code == code.RETURNCODE.DUPLICATEUSER || data.code == code.RETURNCODE.EXPIRED) {
                                    //showError(DUPLICATE_ERROR);
                                    storage('token', '');
                                    console.log(data.message);
                                    window.location.href = '/';
                                    return;
                                } else {
                                    //console.log(data);
                                    checkList.connected = true;
                                }

                            });
                        });
                    });
                };

                // query connector
                Comm.prototype.queryEntry= function(userName, callback) {
                    var route = 'siogate.gateHandler.queryEntry';
                    this.pomelo.init({
                        host: window.location.hostname,
                        port: 3017,
                        log: true
                    }, function () {
                        this.pomelo.request(route, userName, function (data) {
                            pomelo.disconnect();
                            if (data.code === 500) {
                                console.log('queryEntry: find error!');
                                return;
                            }
                            callback(data.host, data.port);
                        });
                    });
                }