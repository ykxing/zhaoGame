/**
 * Created by xingyongkang on 2016/12/21.
 */
code = {
    OK: 200,
    FAIL: 500,

    ENTRY: {
        FA_TOKEN_INVALID: 1001,
        FA_TOKEN_EXPIRE: 1002,
        FA_USER_NOT_EXIST: 1003
    },

    GATE: {
        FA_NO_SERVER_AVAILABLE: 2001
    },

    CHAT: {
        FA_CHANNEL_CREATE: 3001,
        FA_CHANNEL_NOT_EXIST: 3002,
        FA_UNKNOWN_CONNECTOR: 3003,
        FA_USER_NOT_ONLINE: 3004
    },
    STATE: {
        LOADING: -1,
        INIT: 0,
        READY: 1,
        WAIT: 80,
        STARTBETTING: 10,
        BETTING: 20,
        STOPBETTING: 30,
        ANOUNCERESULT: 40,
        CELEBRATE: 50,
        CLEAR: 60,
        GENERATESCENE: 70,
        CHECKSCENE: 80

    },
    COMMAND: {
        HELLO: 88,
        OPERATE: 0,
        LOGIN: 1,
        LOGOUT: 2,
        CHANGESTATE: 3,
        SHOWTIME: 4,
        SHOWBETTING: 5,
        SHOWALLBETTING: 6,
        SHOWUSERS: 7,
        USERLOGIN: 8,
        USERLOGOUT: 9,
        SHOWSCENE: 10,
        SHOWRESULT: 11,
        UPSCORE: 12,
        DOWNSCORE: 13,
        LIVESTREAM: 14,
        CHAT: 15,
        CHECKPRINTER: 16,
        PRINTSCENE: 17,
        UNLOCK: 18,
        SHOWROOMS: 19,
        SHOWROOMINFO: 20,
        ROOMNOTIFY: 21,
        SCENENOTIFY: 22,
        SHOWSCENES: 23,
        HALLNOTIFY: 24,
        ACCOUNTNOTIFY: 25,
        BCREQUESTFROMUSER: 26,
        BCREQUESTFROMROOM: 27,
        BCREQUESTFROMHALL: 28,
        USERREQESTDOWNSCORE:29,
        UPDATEROOMCONFIG:30,
        SHOWMESSAGE:		31,
        FINISHPRINTING:      32
    },

    DATAINDEX: {
        BALANCE: 0,
        SWITCHUNIT: 1,
        USERID: 2,
        BONUS: 3,
        STATE: 4,
        USERTYPE: 5,
        BETSTART: 6
    },
    ACCOUNTOPERATION: {
        UPSCORE: 0,
        DOWNSCORE: 1,
        BET: 2,
        WIN: 3
    },
    USERTYPE: {
        DISABLED: 0,
        USER: 10,
        BOSS: 1,
        ACCOUNTANT: 2,
        ANCHOR: 3,
        PRINTER: 4,
        CHATROOMPRINTER: 5,

        LEVEL1: 77,
        SUPERVISER: 88

    },


    ROOMTYPE: {
        EMPTY: 0,
        HALL: 1,
        CHATROOM: 2,
        GAMEROOM: 3,
        FULL: 4
    },
    /*
     OPERATIONTYPE:{
     ADD:        0,
     GAME:       1,
     WIN:        2,
     TRANSFER:   3,
     BALANCE:    4
     },
     */
    OPERATIONTYPE: {
        UPSCORE: 0,
        DOWNSCORE: 1,
        BET: 2,
        WIN: 3,
        UPSCORETO: 4,
        DOWNSCORETO: 5,
        BALANCE: 6
    },

    RETURNCODE: {
        OK: 200,
        ERROR: 100,
        DUPLICATEUSER: 101,
        EXPIRED: 300,
        NORIGHT: 400,
        DBERROR: 500,
        NAMEEXIST: 501,
        WRONGINTRODUCER: 502,
        NONAME: 503,
        WRONGPASS: 504,
        ROOMIDNULL: 505
    },
    CODESTRING: {
        OK: '操作成功',
        EXPIRED: '登陆过期',
        NORIGHT: '越权操作',
        DBERROR: '数据库出错',
        NAMEEXIST: '用户名已存在',
        WRONGINTRODUCER: '介绍人不存在',
        NONAME: '用户名不存在',
        WRONGPASS: '密码错误',
        ROOMIDNULL: '介绍人暂未分配大厅'
    }

};


var base = 1000;
var increase = 25;
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";
util = {
    urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
    //  html sanitizer
    toStaticHTML: function (inputHtml) {
        inputHtml = inputHtml.toString();
        return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    //pads n with zeros on the left,
    //digits is minimum length of output
    //zeroPad(3, 5); returns "005"
    //zeroPad(2, 500); returns "500"
    zeroPad: function (digits, n) {
        n = n.toString();
        while (n.length < digits)
            n = '0' + n;
        return n;
    },
    spacePad: function (digits, n) {
        n = n.toString();
        while (n.length < digits)
            n = n + ' ';
        return n;
    },
    //it is almost 8 o'clock PM here
    //timeString(new Date); returns "19:49"
    timeString: function (date) {
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
    },

    //it is almost 8 o'clock PM here
    //timeString(new Date); returns "19:49"
    dateString: function (date) {
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString();
        var day = (date.getDay() + 1).toString();
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        var seconds = date.getSeconds().toString();
        return this.zeroPad(4, year) + "-" + this.zeroPad(2, month) + "-" + this.zeroPad(2, day) + " " + this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes) + ":" + this.zeroPad(2, seconds);
    },

    //does the argument only contain whitespace?
    isBlank: function (text) {
        var blank = /^\s*$/;
        return (text.match(blank) !== null);
    }
};


//always view the most recent message when it is added
function scrollDown(base) {
    window.scrollTo(0, base);
    $("#entry").focus();
};

// add message on board
function addMessage(from, target, text, time) {
    var name = (target == '*' ? 'all' : target);
    if (text === null) return;
    if (time == null) {
        // if the time is null or undefined, use the current time.
        time = new Date();
    } else if ((time instanceof Date) === false) {
        // if it's a timestamp, interpret it
        time = new Date(time);
    }
    //every message you see is actually a table with 3 cols:
    //  the time,
    //  the person who caused the event,
    //  and the content
    var messageElement = $(document.createElement("table"));
    messageElement.addClass("message");
    // sanitize
    text = util.toStaticHTML(text);
    //var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ' says to ' + name + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
    var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
    messageElement.html(content);
    //the log is the stream that we view
    $("#messageBoard").append(messageElement);
    base += increase;
    // scrollDown(base);
};

// add account on board
function addAccount(operation, score, time) {
    if (text === null) return;
    if (time == null) {
        // if the time is null or undefined, use the current time.
        time = new Date();
    } else if ((time instanceof Date) === false) {
        // if it's a timestamp, interpret it
        time = new Date(time);
    }
    //every message you see is actually a table with 3 cols:
    //  the time,
    //  the person who caused the event,
    //  and the content
    var messageElement = $(document.createElement("table"));
    messageElement.addClass("message");
    var strOperation = 'OPER';
    switch (operation) {
        case code.ACCOUNTOPERATION.UPSCORE:
            strOperation = '上分';
            break;
        case code.ACCOUNTOPERATION.WIN:
            strOperation = '赢分';
            break;
        case code.ACCOUNTOPERATION.DOWNSCORE:
            strOperation = '赢分';
            break;
        case code.ACCOUNTOPERATION.BET:
            strOperation = '押分';
            break;
    }
    // sanitize
    text = util.toStaticHTML(text);
    //var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ' says to ' + name + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
    var content = '<tr>' + '  <td class="date">' + util.dateString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(strOperation) + '</td>' + '  <td class="msg-text">' + score + '</td>' + '</tr>';
    messageElement.html(content);
    //the log is the stream that we view
    $("#accountBoard").append(messageElement);
    base += increase;
    // scrollDown(base);
};


// init user list
function initUserList(data) {
    users = data.users;
    for (var i = 0; i < users.length; i++) {
        var slElement = $(document.createElement("option"));
        slElement.attr("value", users[i]);
        slElement.text(users[i]);
        $("#usersList").append(slElement);
    }
};

// add item to a list
function addItemToList(listID, item, curItem) {
    var slElement = $(document.createElement("option"));
    slElement.attr("value", item);
    slElement.text(item);
    if (curItem != null) {
        if (item == curItem) {
            slElement.attr("selected", true);
        }
    }
    $("#" + listID).append(slElement);
};
// remove all user from user list
function removeAllItems(listID) {
    $("#" + listID + " option").each(
        function () {
            $(this).remove();
        });
};


// add user in user list
function addUser(user, curUser) {
    var slElement = $(document.createElement("option"));
    slElement.attr("value", user);
    slElement.text(user);
    if (curUser != null) {
        if (user == curUser) {
            slElement.attr("selected", true);
        }
    }
    $("#usersList").append(slElement);
};

// remove all user from user list
function removeUsers() {
    $("#usersList option").each(
        function () {
            $(this).remove();
        });
};
// remove user from user list
function removeUser(user) {
    $("#usersList option").each(
        function () {
            if ($(this).val() === user) $(this).remove();
        });
};

/*****************
 Msg={
 'command':
 'para'
 }
********************/
/*
function sendMsg(msg) {
    var route = "chat.chatHandler.send";
    pomelo.request(route, msg, function (data) {

    });


}
*/
function sendMsg(msg) {
    var route = "chat.chatHandler.send";
    pomelo.notify(route, msg);

}

/*
 pomelo.notify(route, {
 rid: roomID,
 content: msg,
 from: username,
 target: target
 });

 pomelo.request(route, {
 //rid: roomID,
 content: msg,
 // from: username,
 //target: target
 }, function (data) {

 });
 */

/*****************
 Msg={
 'command':
 'para'
 'fromUser'
 'toUser'}

********************/
function sendMsgToUser(msg, toUser) {
    var route = "chat.chatHandler.send";
    var tmsg = {'command':code.COMMAND.BCREQUESTFROMUSER, 'para':msg};
    pomelo.request(route, tmsg, function (data) {

    });

}


function init() {
    checkList.sayHello = true;
    console.log("connection:" + checkList.connected + ";Loading:" + checkList.loaded + ";sayHi:" + checkList.sayHello);
    if (checkList.connected && checkList.loaded && checkList.sayHello) {
        state = code.STATE.READY;
    }
    else {
        if (!checkList.connected) {
            login(storage('userName'), storage('roomID'), storage('token'));
        }

        if (!checkList.sayHello && checkList.connected) {
            console.log('say hello again');
            sendMsg({command: code.COMMAND.HELLO, para: 1});
        }
        setTimeout('init()', 2000);
    }
}

function enterRoom() {
    console.log("connection:" + checkList.connected +  ";sayHi:" + checkList.sayHello);
    if (checkList.connected &&  checkList.sayHello) {
        state = code.STATE.READY;
    }
    else {
        if (!checkList.connected) {
            login(storage('userName'), storage('roomID'), storage('token'));
        }

        if (!checkList.sayHello && checkList.connected) {
            console.log('say hello again');
            sendMsg({command: code.COMMAND.HELLO, para: 1});
        }
        setTimeout('enterRoom()', 3000);
    }
}

function login(username, roomID, myToken) {
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
}

// query connector
function queryEntry(userName, callback) {
    var route = 'siogate.gateHandler.queryEntry';
    pomelo.init({
        host: window.location.hostname,
        port: 3017,
        log: true
    }, function () {
        pomelo.request(route, userName, function (data) {
            pomelo.disconnect();
            if (data.code === 500) {
                console.log('queryEntry: find error!');
                return;
            }
            callback(data.host, data.port);
        });
    });
}



/********
for websocket
 /*****
function login(username, roomID, myToken) {
    queryEntry(username, function (host, port) {
        pomelo.init({
            host: host,
            port: port,
            log: true
        }, function () {
            var route = "connector.entryHandler.enter";
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
}

// query connector
function queryEntry(userName, callback) {
    var route = 'gate.gateHandler.queryEntry';
    pomelo.init({
        host: window.location.hostname,
        port: 3014,
        log: true
    }, function () {
        pomelo.request(route, userName, function (data) {
            pomelo.disconnect();
            if (data.code === 500) {
                console.log('queryEntry: find error!');
                return;
            }
            callback(data.host, data.port);
        });
    });
}
*/

function getDiv(w, h, c) {
    var t = game.make.graphics();
    t.beginFill(c);
    t.drawRoundedRect(0, 0, w, h, 45);
    t.endFill();
    var tex = t.generateTexture();
    return game.make.image(0, 0, tex);

}
function bytes2Hexes(bytes) {
    var res = [];
    for (var i = 0; i < bytes.length; i++) {
        var ti = bytes[i];
        var ts = ti.toString(16);
        if (ti < 16) {
            ts = '0' + ts;
        }
        ts.toUpperCase();
        res.push(ts);
    }
    return res;
}
function hexs2Bytes(hexes) {
    var res = [];
    for (var i = 0; i < hexes.length; i++) {
        var ts = hexes[i];
        var ti = parseInt(ts, 16);
        ;
        res.push(ti);
    }
    return res;
}

/****************
 storage local varibles to communate between pages;

 ****************/
function storage(varName, varValue) {

    var localStorage = window.localStorage;
    //clear
    if (varName == null && varValue == null) {
        localStorage.clear();
        return;
    }

    //Set value
    if (varName != null && varValue != null) {
        localStorage[varName] = varValue;
        return;
    }

    // Get value
    if (varName != null && varValue == null) {
        if (localStorage[varName] == null) {
            console.log(varName + "is not find!");
            return null;
        }
        else {
            var res;
            if (varName == 'roomID' || varName == 'userType' || varName == "roomType") {
                res = parseInt(localStorage[varName]);
            }
            else {
                res = (localStorage[varName]);
            }
            console.log(varName + " = " + localStorage[varName]);
            return res;

        }
    }
}

/****************
 get description of usertype;

 USERTYPE:{
        UNDEFINED:      0,
        USER:         10,
        BOSS:         1,
        ACCOUNTANT:   2,
        PRINTER:      3,
        ANCHOR:       4,
        LEVEL1:       77,
        SUPERVISER:   88

    },
 ****************/
function userTypeString(userType) {
    var suserType = '非用户类型';
    switch (userType) {
        case code.USERTYPE.DISABLED:
            suserType = '禁用';
            break;
        case code.USERTYPE.BOSS:
            suserType = '老板';
            break;
        case code.USERTYPE.LEVEL1:
            suserType = '推广人';
            break;
        case code.USERTYPE.SUPERVISER:
            suserType = '超级管理员';
            break;
        case code.USERTYPE.PRINTER:
            suserType = '保单箱';
            break;
        case code.USERTYPE.CHATROOMPRINTER:
            suserType = '五星宏辉保单箱';
            break;
        case code.USERTYPE.ACCOUNTANT:
            suserType = '上分员';
            break;
        case code.USERTYPE.ANCHOR:
            suserType = '主持人';
            break;
        case code.USERTYPE.USER:
            suserType = '玩家';
            break;
        default:
            break;
    }
    return suserType;
}

/****************
 get description of roomtype;

 ****************/
function roomTypeString(roomType) {
    var sroomType = '';
    switch (roomType) {
        case code.ROOMTYPE.EMPTY:
            sroomType = '未分配房间';
            break;
        case code.ROOMTYPE.HALL:
            sroomType = '大厅';
            break;
        case code.ROOMTYPE.CHATROOM:
            sroomType = '五星宏辉';
            break;
        default:
            sroomType = '未定义类型';
            break;
    }
    return sroomType;
}

/****************
 get description of operation;

 ****************/
function operationTypeString(operationType) {
    var soperationType = '未定义类型';
    switch (operationType) {
        case code.OPERATIONTYPE.UPSCORE:
            soperationType = '上分';
            break;
        case code.OPERATIONTYPE.DOWNSCORE:
            soperationType = '兑奖';
            break;
        case code.OPERATIONTYPE.BET:
            soperationType = '押分';
            break;
        case code.OPERATIONTYPE.WIN:
            soperationType = '赢分';
            break;
        case code.OPERATIONTYPE.UPSCORETO:
            soperationType = '給上分';
            break;
        case code.OPERATIONTYPE.DOWNSCORETO:
            soperationType = '給兑奖';
            break;
        case code.OPERATIONTYPE.BALANCE:
            soperationType = '结余';
            break;
        default:
            soperationType = '未定义类型';
            break;
    }
    return soperationType;
}

//modal dialog
function myDialog() {
    var reg = new RegExp("\\[([^\\[\\]]*?)\\]", 'igm');
    var alr = $("#ycf-alert");
    var ahtml = alr.html();

    /*
     //关闭时恢复 modal html 原样，供下次调用时 replace 用
     var _init = function () {
     alr.on("hidden.bs.modal", function (e) {
     $(this).html(ahtml);
     });
     }();
     */
    /* html 复原不在 _init() 里面做了，重复调用时会有问题，直接在 _alert/_confirm 里面做 */


    var _alert = function (options) {
        alr.html(ahtml);	// 复原
        alr.find('.ok').removeClass('btn-success').addClass('btn-primary');
        alr.find('.cancel').hide();
        _dialog(options);

        return {
            on: function (callback) {
                if (callback && callback instanceof Function) {
                    alr.find('.ok').click(function () {
                        callback(true)
                    });
                }
            }
        };
    };

    var _confirm = function (options) {
        alr.html(ahtml); // 复原
        alr.find('.ok').removeClass('btn-primary').addClass('btn-success');
        alr.find('.cancel').show();
        _dialog(options);

        return {
            on: function (callback) {
                if (callback && callback instanceof Function) {
                    alr.find('.ok').click(function () {
                        callback(true)
                    });
                    alr.find('.cancel').click(function () {
                        callback(false)
                    });
                }
            }
        };
    };

    var _dialog = function (options) {
        var ops = {
            msg: "提示内容",
            title: "操作提示",
            btnok: "确定",
            btncl: "取消"
        };

        $.extend(ops, options);

        console.log(alr);

        var html = alr.html().replace(reg, function (node, key) {
            return {
                Title: ops.title,
                Message: ops.msg,
                BtnOk: ops.btnok,
                BtnCancel: ops.btncl
            }[key];
        });

        alr.html(html);
        alr.modal({
            width: 500,
            backdrop: 'static'
        }).css({
            width: '300px',
            'margin-left': function () {
                return -($(this).width() / 2);
            }
        });
    }

    return {
        alert: _alert,
        confirm: _confirm
    }

}

function clone(source) {
    var result = {};
    for (var key in source) {
        result[key] = typeof source[key] === 'object' ? clone(source[key]) : source[key];
    }
    return result;
}

///