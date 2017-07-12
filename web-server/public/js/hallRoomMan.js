/**
 * Created by xingyongkang on 2016/12/21.
 */

var pomelo = window.pomelo;
var httpHost = location.href.replace(location.hash, '');
var username = '';
var curUserName = '*';
var curRoomID = 0;
var curRow;
var userType = 0;
var roomID = 1;
var token;
var msgQueue = [];
var state = code.STATE.INIT;
var bIfFirstIn = true;
var myTimer = 0;
var game;

var bIfLoadingFinish = false;
var checkList = {connected: false, loaded: false, sayHello: false};

var noSleepEnabled = false;
var noSleep;
var switchUnit = 0;

var sceneBmp;
var scenes = {}
var rooms = {};
var btnGroup;



$(document).ready(function() {
    $("#fakeLoader").fakeLoader({
        timeToHide:2000,
        bgColor:"#e74c3c",
        spinner:"spinner2"
    });

    username = storage("userName");
    token = storage('token');
    roomID = storage('roomID');
    if (username == null || token == null)
        window.location.href = '/';

    $.post(httpHost + '/../getUserInfo', {'username': username, 'token': token}, function (data) {
        if (data.code != code.RETURNCODE.OK) {
            //console.log(data.message);
            layer.msg(data.message);
            window.location.href = '/'
        } else {

            storage('userName', data.userName);
            username = data.userName;
            storage('userType', data.userType);
            userType = data.userType;
            storage('balance', data.balance);
            storage('parent', data.parent);
            storage('roomID', data.roomID);
            storage('homeRoomID', data.roomID);
            initRoom();
            $('#userName').html('<i class="icon-user icon-large"></i>' + userTypeString(data.userType) + ":" + username);

        }
    });
    noSleep = new NoSleep();

    //login(username, roomID, token);

    //wait message from the server.
    pomelo.on('onServer', function (data) {
        if (data.msg != undefined) {
            msgQueue.push(data.msg);
        }
        else {
            console.log(data);
        }
    });
    //handle disconect message, occours when the client is disconnect with servers
    pomelo.on('disconnect', function (reason) {
        //msgQueue.push(reason);
        if (checkList.connected) {
            window.location.href = '/';
            return;
        }

    });

    init();

    game = new Phaser.Game(720, 800, Phaser.AUTO, 'main', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });


});

function noSleepEnable(){
    console.log('start btn is pressed');
    if(!noSleepEnabled) {
        noSleep.enable();
        noSleepEnabled = true;
        $('#noSleepEnableMenu').html('<i class="icon-ok "></i>'+'屏幕常亮');
    }
    else{
        noSleep.disable();
        noSleepEnabled = false;
        $('#noSleepEnableMenu').html('<i class="icon-remove "></i>'+'屏幕常亮');

    }
}

function initRoom(){
    var userType = storage('userType');
    console.log('initRoom Start');
    console.log('userType= '+ userType);

    switch(userType){
        case code.USERTYPE.BOSS:
            break;
        case code.USERTYPE.LEVEL1:
            $('#changeUserType').hide();
            break;
        case code.USERTYPE.ACCOUNTANT:

            break;
        default:
            $('#changeUserType').hide();
            $('#upScore').hide();
            $('#downScore').hide();
            $('#switchUnit').hide();
            //$('#getAccount').hide();
            break;
    }
    $('#getSubUserInfo').click();
    $('#getRooms').click();
}

$("#exitBtn").click(function (e) {
    storage();
    storage('userName',username);
    window.location.href = '/';
});


$('#getSubUserInfo').click(function() {
     $.post(httpHost + '/../getUsersInfo', {'username': username, 'token': token,'parent':username}, function (data) {
        if (data.code == code.RETURNCODE.OK){
            for(var i = 0; i<data.users.length; i++)
                data.users[i]['userType'] =  userTypeString(data.users[i]['userType']);
            $('#subUserTable').bootstrapTable('destroy').bootstrapTable({data:data.users});
        }
        else {
        }
    });

});
function updateAccount(target,operation,score,fromUser){
    $.post(httpHost + '/../updateAccount', {'username':fromUser , 'token': token,'score': score,'target':target,'operationType':operation}, function (data) {
        if (data.code == code.RETURNCODE.OK) {
            if(operation == code.OPERATIONTYPE.UPSCORE) {
                sendMsgToUser({command: code.COMMAND.UPSCORE, para: score, fromUser: fromUser, toUser: target}, target);
            }
            else {
                sendMsgToUser({command:code.COMMAND.DOWNSCORE,para:score* -1,fromUser:fromUser,toUser:target},target);
            }
            //switchUnit = 0;
            //$("#switchUnit").text("分数：" + switchUnit);
            $('#getSubUserInfo').click();

        }
        else{
            console.log(data.message);
        }
    });
}
function changeUserType(target,userType){
    $.post(httpHost + '/../updateUserType', {
        'username': username,
        'token': token,
        'target': target,
        'userType': userType
    }, function (data) {
        if (data.code == code.RETURNCODE.OK) {
            $('#getSubUserInfo').click();
        } else {
            layer.msg(data.message);
        }
    });
}
$("#subUserTable")
    .on('click-row.bs.table', function (e, row, ele, field) {
        curUserName = row.userName;
        curRow = row;
        if(field == 'userType'){
            layer.confirm('', {
                title: '更改' + curRow["userName"] + '的用户类型',
                btn: ['禁止登陆', '推广人', '保单箱', '普通玩家'], //按钮
                btnAlign:'l',
                yes: function (index) {
                    changeUserType(curUserName,code.USERTYPE.DISABLED);
                    //layer.close(index);
                }, btn2: function (index, layro) {
                    changeUserType(curUserName,code.USERTYPE.LEVEL1);
                    layer.close(index);
                }, btn3: function (index, layro) {
                    changeUserType(curUserName,code.USERTYPE.CHATROOMPRINTER);
                    //layer.close(index);
                }, btn4: function (index, layro) {
                    changeUserType(curUserName,code.USERTYPE.USER);
                    //layer.close(index);
                }, cancel: function(){
                    // layer.msg('do nothing');
                }
            });
        }

        if(field == 'balance'){
            layer.confirm('', {
                title: '给' + curRow["userName"] + '上下分',
                btn: ['上分', '兑奖'], //按钮
                btnAlign:'l',
                yes: function (index) {
                    layer.prompt({title: '给' + curRow['userName'] + '上分：'}, function (val, index1) {
                        var tScore = parseInt(val);
                        updateAccount(curUserName,code.OPERATIONTYPE.UPSCORE,tScore,storage('userName'));
                        layer.close(index1);
                    });
                    layer.close(index);
                    //layer.close(index);
                }, btn2: function (index, layro) {
                    layer.prompt({title: '给' + curRow['userName'] + '上分：'}, function (val, index1) {
                        var tScore = parseInt(val);
                        updateAccount(curUserName,code.OPERATIONTYPE.DOWNSCORE,tScore,storage('userName'));
                        layer.close(index1);
                    });
                    layer.close(index);
                }, cancel: function(){
                    // layer.msg('do nothing');
                }
            });
        }

    })
    .on('load-success.bs.table', function (e, data) {
        if (curUserName.length > 2) {
            var data2 = $('#subUserTable').DataTable().rows().nodes();
           // var data2 = $('#subUserTable').DataTable().rows().data();
            $(data2).each(function (index, item) {
                if (data[index].userName == curUserName) {
                    $(item).addClass('selected');
                } else {
                    $(item).removeClass('selected');
                }
            });
        }
    })


$('#switchUnit').click(function () {
    switchUnit = (switchUnit + 100) % 2000;
    if (switchUnit == 0)
        switchUnit = 2000;
    $("#switchUnit").text("分数：" + switchUnit);
});
$('#upScore').click(function () {

    if (curUserName == "" || switchUnit == 0) {

    }
    else {
        $.post(httpHost + '/../updateAccount', {'username': username, 'token': token,'score': switchUnit,'target':curUserName,'operationType':code.OPERATIONTYPE.UPSCORE}, function (data) {
            if (data.code == code.RETURNCODE.OK) {
                sendMsgToUser({command:code.COMMAND.UPSCORE,para:switchUnit,fromUser:storage('userName'),toUser:curUserName},curUserName);
                switchUnit = 0;
                $("#switchUnit").text("分数：" + switchUnit);
                $('#getSubUserInfo').click();

            }
            else{
                console.log(data.message);
            }
        });
    }

});
$('#downScore').click(function () {
    if (curUserName == "" || switchUnit == 0) {

    }
    else {
        $.post(httpHost + '/../updateAccount', {'username': username, 'token': token,'score': switchUnit,'target':curUserName,'operationType':code.OPERATIONTYPE.DOWNSCORE}, function (data) {
            if (data.code == code.RETURNCODE.OK) {
                sendMsgToUser({command:code.COMMAND.DOWNSCORE,para:switchUnit*-1,fromUser:storage('userName'),toUser:curUserName},curUserName);
                switchUnit = 0;
                $("#switchUnit").text("分数：" + switchUnit);
                $('#getSubUserInfo').click();

            }
            else{
                console.log(data.message);
            }
        });
    }
});

$('#getAccount').click(function () {
    console.log('get Account:'+ curUserName);
    if (curUserName.length <=2) {
        layer.msg("请选择玩家");
    }
    else {
        $.post(httpHost + '/../getAccount', {'username': username, 'token': token,'target':curUserName}, function (data) {
            if (data.code != code.RETURNCODE.OK) {
                $("#accountTable").bootstrapTable('destroy').bootstrapTable({
                    data:[]
                });
            } else {
                for(var i = 0; i<data.account.length; i++){
                    data.account[i]['operation'] = operationTypeString(data.account[i]['operation']);
                    var date = new Date(data.account[i]['time']);
                    //data.account[i]['time'] = util.dateString(date);
                    data.account[i]['time'] = date.toLocaleString();
                }
                $("#accountTable").bootstrapTable('destroy').bootstrapTable({
                    data: data.account
                });
            }
        });
    }

});


//////////////////room manage

$('#getRooms').click(function() {
    console.log('roomID='+storage('roomID'));
    $.post(httpHost + '/../getRooms', {'username': username, 'token': token,'roomID':storage('roomID')}, function (data) {
        if (data.code == code.RETURNCODE.OK){
            console.log('get rooms ='+data.rooms.length);
            var roomList = [];
            for(var i = 0; i<data.rooms.length; i++){
                var troom = {
                    'roomID': data.rooms[i].roomID,
                    'roomName': data.rooms[i].roomName,
                    'roomType': roomTypeString(data.rooms[i].roomType),
                    'roomDescrib': data.rooms[i].roomDescrib,
                    'config': data.rooms[i].config
                };
                var tconfig = JSON.parse(data.rooms[i].config);
                troom['limitScoreOfKing'] = tconfig.limitScoreOfKing;
                troom['limitScoreOfOthers'] = tconfig.limitScoreOfOthers;
                troom['maxNumOfUser'] = tconfig.maxNumOfUser;
                troom['switchString'] = tconfig.switchString;
                roomList.push(troom);
            }

            $('#roomTable').bootstrapTable('destroy').bootstrapTable({data:roomList});
        }
        else {
        }
    });

});

$("#roomTable")
    .on('click-row.bs.table', function (e, row, ele, field) {

        curRoomID = row.roomID;
        curRow = row;
        var tconfig = JSON.parse(curRow['config']);
        /*
        console.log('press field' + field);
        if(field =='limitScoreOfKing'){
            layer.prompt({title: '将' + curRow['roomName'] + '的王限注由' + curRow['limitScoreOfKing'] + '修改为：'}, function (val, index1) {
                tconfig.limitScoreOfKing = parseInt(val);
                updateRooms(tconfig);
                layer.close(index1);
            });
        }
        if(field =='limitScoreOfOthers'){
            layer.prompt({title: '将' + curRow['roomName'] + '的其它限注由' + curRow['limitScoreOfOthers'] + '修改为：'}, function (val, index1) {
                tconfig.limitScoreOfOthers = parseInt(val);
                updateRooms(tconfig);
                layer.close(index1);
            });
        }

        return;
        */
        layer.confirm('', {
            title: '选择对' + curRow["roomName"] + '的操作',
            btn: ['更改王的限注', '更改其它的限注', '更改切换分值', '更改最大人数'], //按钮
            btnAlign:'l',
            yes: function (index) {
                layer.prompt({title: '将' + curRow['roomName'] + '的王限注由' + curRow['limitScoreOfKing'] + '修改为：'}, function (val, index1) {
                    tconfig.limitScoreOfKing = parseInt(val);
                    updateRooms(tconfig);
                    layer.close(index1);
                });
                layer.close(index);
            }, btn2: function (index, layro) {
                layer.prompt({title: '将' + curRow['roomName'] + '的其它限注由' + curRow['limitScoreOfOthers'] + '修改为：'}, function (val, index1) {
                    tconfig.limitScoreOfOthers = parseInt(val);
                    updateRooms(tconfig);
                    layer.close(index1);
                });
                layer.close(index);
            }, btn3: function (index, layro) {
                layer.msg('third button');

                layer.prompt({title: '将' + curRow['roomName'] + '的切换由' + curRow['switchString'] + '修改为：'}, function (val, index1) {
                    tconfig.switchString = val;
                    updateRooms(tconfig);
                    layer.close(index1);
                });

                //layer.close(index);
            }, btn4: function (index, layro) {
                layer.prompt({title: '将' + curRow['roomName'] + '最多人数限制' + curRow['maxNumOfUser'] + '修改为：'}, function (val, index1) {
                    tconfig.maxNumOfUser = val;
                    updateRooms(tconfig);
                    layer.close(index1);
                });
                layer.close(index);
            }, cancel: function(){
               // layer.msg('do nothing');
            }
        });
        console.log('curRoomID=' + curRoomID);
    });


function updateRooms(tconfig){

    $.post(httpHost + '/../updateRooms', {
        'username': username,
        'token': token,
        'fieldName': 'config',
        'fieldValue': JSON.stringify(tconfig),
        'roomID': curRoomID
    }, function (data) {
        if (data.code == code.RETURNCODE.OK) {
            $('#getRooms').click();
            sendMsg({command: code.COMMAND.UPDATEROOMCONFIG,para: curRoomID});
        } else {
            //layer.msg(data.message);
            console.log(data.message);
        }

    });
}



/////////
function chat(event){
    console.log('select one');
    var s = $(this).text();
    var toUser = s.split('(')[0];
    if(toUser == '全体')
        toUser = '*';
    console.log(toUser);
    var mes = $(':input#message').val();
    if (toUser == "" || mes == "") {

    }
    else {
        sendMsg({command: code.COMMAND.CHAT, para: {mes: mes, to: toUser}});
        var blen = $("#messageBoard tr").length;
        if (blen > 5) {
            $("#messageBoard tr").eq(0).remove();
        }
        if(toUser != "*")
            addMessage(username, "", mes);
        $('#message').val("");

    }


}


function preload() {

}
function create()
{

    // game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    //game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

    //game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    //game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //game.scale.scaleMode = Phaser.ScaleManager.RESIZE;

    game.stage.backgroundColor = '#ffffff';

    //	You can listen for each of these events from Phaser.Loader
    game.load.onLoadStart.add(loadStart, this);
    game.load.onFileComplete.add(fileComplete, this);
    game.load.onLoadComplete.add(loadComplete, this);

    loadingText = game.add.text(50,100, "点击屏幕开始装载\nPress to Loading ", { font: "32px Arial", fill: "#ff0044", wordWrap: true, wordWrapWidth: 500, align: "left"});
    loadingText.anchor.set(0.0);

    setTimeout(loadFiles(),1);
    //setTimeout(actionOnClickFullScreen,1);
    //$('#start').click();
    //game.input.onTap.addOnce(actionOnClickFullScreen,this);
}
function loadFiles()
{
    if(bIfLoadingFinish == true)
        return;
    for(var i = 0; i<5; i++)
        game.load.image('pokeicon'+i,'assets/pokeicon_0'+i+'.png');
    game.load.start();
}
function loadStart()
{
    loadingText.setText("Loading...");
}
function fileComplete(progress,cacheKey,success,totalLoaded,totalFiles)
{
    loadingText.setText("装载进度...: "+ progress + "%"+"\nLoading...: "+ progress + "%- "+ totalLoaded + " Out of "+ totalFiles);
}

function loadComplete() {
    bIfLoadingFinish = true;
    //game.add.image(0,0,'desktop');
    loadingText.text = '';
    //sceneBmp = game.make.bitmapData(720,800);
    //sceneBmp = game.make.bitmapData(650,400);
    //sceneBmp.addToWorld(360,10).anchor.setTo(0.5,0);

    checkList.loaded = true;
}

function update() {

    if(state == code.STATE.INIT) {

        while(true) {
            var msg = msgQueue.shift();
            if (msg == undefined)
                break;
            switch (msg.command) {
                case code.COMMAND.CHANGESTATE:
                    break;
                case code.COMMAND.HELLO:
                    checkList.sayHello = true;
                    break;
            }
        }

        return;
    }


    while(true)
    {
        var msg = msgQueue.shift();
        if(msg == undefined)
            break;
        switch(msg.command) {
            case code.COMMAND.CHANGESTATE:
                if (state == code.STATE.INIT) {
                    return;
                }
                else {

                    state = msg.para;
                    bIfFirstIn = true;
                }
                break;

            case code.COMMAND.SHOWUSERS:
                $('#usersList').empty();
                var s = $('<a class ="nuserList" href="#" ></a>').text('全体');
                $('#usersList').append(s);

                for(var user in msg.para) {
                    if(user == username){
                        $('#balance').html('<i class="icon-money "></i>' + msg.para[user][code.DATAINDEX.BALANCE]);
                    }
                    var s = $('<a class ="nuserList" href="#" ></a>');
                    var ts = user;
                    if (msg.para[user][code.DATAINDEX.USERTYPE] == code.USERTYPE.USER)
                        ts = ts + '(' + msg.para[user][code.DATAINDEX.BALANCE] + ')';
                    else
                        ts = ts + '(' + userTypeString(msg.para[user][code.DATAINDEX.USERTYPE]) + ')';
                    $('#usersList').append("&nbsp;&nbsp;");
                    s.text(ts);
                    $('#usersList').append(s);

                }

                $('.nuserList').on('click',chat);


                break;
            case code.COMMAND.SHOWROOMS:
            case code.COMMAND.SHOWSCENES:
                break;
            case code.COMMAND.SHOWROOMINFO:
                $('#roomName').html('<i class="icon-home icon-large "></i>' + roomTypeString(msg.para['roomType'])+":"+ msg.para['roomName']+'    ('+'在线'+msg.para['numOfUsers']+'人)' );
                break;
            case code.COMMAND.CHAT:
                var blen = $("#messageBoard tr").length;
                if(blen >5){
                    $("#messageBoard tr").eq(0).remove();
                }
                addMessage(msg.para.from,"",msg.para.message);
                break;
            case code.COMMAND.USERREQESTDOWNSCORE:
                console.log('GET Request From User');
                console.log(msg.para);
                var toUser = msg.para.userName;
                var toScore = msg.para.score;
                $.post(httpHost + '/../updateAccount', {'username': username, 'token': token,'score': msg.para.score,'target':msg.para.userName,'operationType':code.OPERATIONTYPE.DOWNSCORE}, function (data) {
                    if (data.code == code.RETURNCODE.OK) {
                        sendMsgToUser({command:code.COMMAND.DOWNSCORE,para: -1*toScore,fromUser:storage('userName'),toUser:toUser},toUser);
                        //switchUnit = 0;
                       // $("#switchUnit").text("分数：" + switchUnit);
                        $('#getSubUserInfo').click();
                    }
                    else{
                        console.log(data.message);
                    }
                });
                break;
            default:
                //msgQueue.push(msg);
                break;
        }
    }
    switch(state) {
        case code.STATE.READY:
            if(bIfFirstIn) {

                //sendMsg({command: code.COMMAND.SHOWBETTING, para: 0});
                //sendMsg({command: code.COMMAND.SHOWALLBETTING, para: 0});
                //sendMsg({command: code.COMMAND.SHOWSCENE, para: 0});
                sendMsg({command: code.COMMAND.SHOWUSERS, para: 0});
                sendMsg({command: code.COMMAND.SHOWROOMS, para: 0});
                sendMsg({command: code.COMMAND.SHOWROOMINFO, para: 0});
                sendMsg({command: code.COMMAND.SHOWSCENES, para: 0});
                bIfFirstIn =false;
            }
            break;
    }

}
function render(){

}
function onBtnGroupDown(sprite) {

    //sprite.tint = 0x00ff00;
    console.log(sprite.name);
}
function actionOnClickFullScreen(){

    /*
     if (game.scale.isFullScreen) {
     game.scale.stopFullScreen();
     }
     else {
     game.scale.startFullScreen(false);
     }
     */
    /*
     if(!wakeLockEnabled ) {
     noSleep.enable();
     wakeLockEnabled = true;
     }
     */
    loadFiles();
}
