/**
 * Created by xingyongkang on 2016/12/21.
 */


var sceneGroup;
var scenesBmp = [];
var startY;
var bIfPrinter = false;
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

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.forceLandscape = true;

    game.stage.backgroundColor = '#ffffff';

    //	You can listen for each of these events from Phaser.Loader
    game.load.onLoadStart.add(loadStart, this);
    game.load.onFileComplete.add(fileComplete, this);
    game.load.onLoadComplete.add(loadComplete, this);

    loadingText = game.add.text(50,100, "点击屏幕开始装载\nPress to Loading ", { font: "32px Arial", fill: "#ff0044", wordWrap: true, wordWrapWidth: 500, align: "left"});
    loadingText.anchor.set(0.0);

    setTimeout(loadFiles(),1);
   // setTimeout(actionOnClickFullScreen,1);
    //$('#start').click();
    //game.input.onTap.addOnce(actionOnClickFullScreen,this);
}
function loadFiles()
{
    if(bIfLoadingFinish == true)
        return;
    game.load.image('sceneBack','assets/sceneBackSimple.png');

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

    sceneGroup = game.add.group();
    sceneGroup.inputEnableChildren = true;
    var item;

    for (var i = 0; i < 6; i++)
    {
        scenesBmp[i] = game.make.bitmapData(720,640);
       // scenesBmp[i].cls();
       // scenesBmp[i].fill(255,0,0,0);
        scenesBmp[i].draw('sceneBack',0,0);
        scenesBmp[i].text(i+1,10,60," 32px Arial",'rgb(255,0,0)',true);
        var item = sceneGroup.create(360,640*i, scenesBmp[i],i);

        item.id = i;
        item.anchor.setTo(0.5,0);
        // Enable input detection, then it's possible be dragged.
        item.inputEnabled = true;

        // Make this item draggable.
        //item.input.enableDrag(false,true);
        item.input.enableDrag();

        // Limit drop location to only the 2 columns.
        item.events.onDragStart.add(dragStart);
        item.events.onDragUpdate.add(dragUpdate);
        item.events.onDragStop.add(dragStop);

    }

    sceneGroup.onChildInputDown.add(selected, this);
    checkList.loaded = true;
}

function selected(sprite, pointer){
    console.log('selected '+ sprite.id);
}

function dragStart(sprite) {
    console.log('dragStart');
    startY = sprite.y;
}

function dragUpdate(sprite, pointer, dragX, dragY, snapPoint) {
    console.log('dragupdate');
   // console.log(pointer);
   // console.log(snapPoint);
   // console.log(dragX);
   // console.log(dragY);

    sceneGroup.forEach(function(item) {
        item.x = game.world.centerX;
        if (item != sprite) {
            item.y = (sprite.y - 640* sprite.id) + item.id * 640;
        }

    });
}

function dragStop(sprite) {

   if(Math.abs(sprite.y - startY) < 20){
         var rid = sprite.roomID;
         window.localStorage.setItem('roomID', rid);
         console.log('roomID=' + rid);
         console.log('userType=' + userType);
         if (rid > 0 &&(rooms[rid]['numOfUsers']<rooms[rid]['maxNumOfUser'])) {
             switch (storage('userType')) {
                 case code.USERTYPE.USER:

                     window.location.href = '/ChatRoomUser.html';
                     break;
                 case code.USERTYPE.PRINTER:
                     window.location.href = '/ChatRoomUser.html';
                     break;

             }
         }
         else {
             if(rid <= 0){
                 layer.msg('该机台尚未开通');
             }
             if(rooms[rid]['numOfUsers']>=rooms[rid]['maxNumOfUser']){
                 layer.msg('该机台人数已超过限制，请选择其它机台');
             }
         }
         return;
     }
    if(sprite.y > startY){
        if(sprite.id > 0)
            sprite.y = startY + 640;
        else
            sprite.y = startY;
    }
    else{
        if(sprite.id < 5)
            sprite.y = startY - 640;
        else
            sprite.y = startY;
    }

    sceneGroup.forEach(function(item) {
        item.x = game.world.centerX;
        if (item != sprite) {
            item.y = (sprite.y - 640* sprite.id) + item.id * 640;
        }

    });

}

function update() {

    if(state == code.STATE.INIT) {

        while(true) {
            var msg = msgQueue.shift();
            if (msg == undefined)
                break;
            if(msg.command == code.COMMAND.HELLO){
                    checkList.sayHello = true;
                    break;
            }
        }
        return;
    }

    var curDate = new Date();
    if(!bIfPrinter)
        printerLastResponseTime = curDate;
    if((curDate.getTime() - printerLastResponseTime.getTime())>3000){
        if(printerState == true)
        {
            printerState = false;
            sendMsg({command: code.COMMAND.CHECKPRINTER, para: 0});
        }

    }
    else {
        if(printerState == false)
        {
            printerState = true;
            sendMsg({command: code.COMMAND.CHECKPRINTER, para: 1});
        }
    }

    while(true)
    {
        var msg = msgQueue.shift();
        if(msg == undefined)
            break;
        switch(msg.command) {
            case code.COMMAND.SHOWMESSAGE:
                layer.msg(msg.para);
                break;
            case code.COMMAND.CHANGESTATE:
                if (state == code.STATE.INIT) {
                    return;
                }
                else {

                    state = msg.para;
                    bIfFirstIn = true;
                }
                break;
            case code.COMMAND.UPSCORE:
                layer.msg(msg.para);
                break;
            case code.COMMAND.SHOWBETTING:

                $('#balance').html('余分:' + msg.para[code.DATAINDEX.BALANCE]);

                //$('#balance').html('<i class="icon-money "></i>' + '<font color="rgb(227,203,28)">'+msg.para[code.DATAINDEX.BALANCE])+'</font>';

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
                if(msg.command == code.COMMAND.SHOWROOMS){
                    //rooms = clone(msg.para);
                    rooms = msg.para;
                    for(var room in rooms)
                        rooms[room]['roomType'] = roomTypeString(rooms[room]['roomType']);
                }
                else {
                    scenes = msg.para;
                }
                var roomIndex = 0;
                var offset = 55;
                for(var room in rooms) {
                    if (scenes.hasOwnProperty(room)) {

                        sceneGroup.getAt(roomIndex)['roomID'] = rooms[room]['roomID'];
                        var curNo = scenes[room]['curNo'];
                        if (scenesBmp[roomIndex] != null) {
                            scenesBmp[roomIndex].cls();
                            scenesBmp[roomIndex].fill(255, 255, 255, 0);
                            scenesBmp[roomIndex].draw('sceneBack',0,0);
                            scenesBmp[roomIndex].text(roomIndex+1, 20, offset, " 32px Arial", 'rgb(255,0,0)', true);
                            scenesBmp[roomIndex].text( rooms[room]['numOfUsers']+'/'+ rooms[room]['maxNumOfUser'], 650, offset, " 32px Arial", 'rgb(255,0,0)', true);
                            scenesBmp[roomIndex].text(scenes[room]['sceTime'].toString(), 200, 46+offset, " 32px Arial", 'rgb(255,0,0)', true);
                            scenesBmp[roomIndex].text(scenes[room]['sceNo'].toString(), 45, 495+offset, " 32px Arial", 'rgb(255,0,0)', true);
                            scenesBmp[roomIndex].text(scenes[room]['curNo'].toString(), 45, 535+offset, " 32px Arial", 'rgb(255,0,0)', true);
                            var stat = [0, 0, 0, 0, 0];
                            for (var i = 0; i < curNo; i++) {
                                stat[scenes[room][i.toString()]] = stat[scenes[room][i.toString()]] + 1;
                                var icon = 'pokeicon' + scenes[room][i.toString()];
                                scenesBmp[roomIndex].draw(icon, (i % 14) * 51 + 8, Phaser.Math.floorTo(i / 14) * 51 + 66 +offset, 40, 40);
                            }
                            for (var i = 0; i < 5; i++) {
                                scenesBmp[roomIndex].text(stat[i], (i * 121) + 166, 575+offset, "32px Arial", 'rgb(255,0,0)', true);
                            }
                        }
                        roomIndex++;
                    }
                }
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
            case code.COMMAND.PRINTSCENE:
                console.log('I pretend ptinting scece');
                console.log(msg.para);
                if(!bIfPrinter) {
                    sendMsg({command: code.COMMAND.FINISHPRINTING, para: msg.para['roomID']});
                }
                else {

                    if (plugin().valid) {
                        printScene(msg.para);
                        sendMsg({command: code.COMMAND.FINISHPRINTING, para: msg.para['roomID']});
                    }
                }
                break;
            case code.COMMAND.UNLOCK:
                console.log('unLock');
                if(!bIfPrinter){

                }
                else {
                    if (plugin().valid)
                        unlock();
                }
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
    //loadFiles();
}

//printer
var ser;
function plugin0()
{
    return document.getElementById('plugin0');
}
plugin = plugin0;

function recv(bytes, size)
{
    var hexs = bytes2Hexes(bytes);
    // console.log("Receive:"+hexs);

    printerLastResponseTime = new Date();
    if(hexs == '44'){
        if(printerState == false)
        {
            printerState = true;
            console.log('printer Ok');
            sendMsg({command: code.COMMAND.CHECKPRINTER, para: 1});
        }

    }
    if(hexs == '88'){
        if(printerState == true)
        {
            printerState = false;
            console.log('printer error');
            sendMsg({command: code.COMMAND.CHECKPRINTER, para: 0});
        }
    }
    /*var bytess = hexs2Bytes(hexs);
     console.log(bytess);
     for(var i=0;i<size;++i)
     {
     //console.log(bytes[i].toString(16));
     // ser.send(bytes[i]);
     }
     */

}
function checkPrinter()
{
    print(ser,['10','04','02']);//check
}
function unlock()
{
    print(ser,['1B','5A','03','03']);//unlock

}
function printScene(scene){
    console.log('begin to print...');
    print(ser,['1B','40','1C','26']);//init

    //print title
    print(ser,'机台:'+scene['roonName']);
    print(ser,['0A']);
    print(ser,['0A']);

    //print time
    var date = new Date();
    print(ser,'打单时间:'+scene['sceNo']);
    print(ser,['0A']);
    print(ser,['0A']);

    for(var i = 0; i<20; i++) {
        print(ser,['1C','21','00']);////字符加宽打印 1c 21 hanzi 1b 21 wnglish
        for (var j = 0; j < 5; j++) {
            var k = i*5 + j;
            var color = scene[k.toString()];
            //var color = Math.round((Math.random() * 5));
            var resStr = "黑";
            switch (color) {
                case 0:
                    resStr = "黑";
                    break;
                case 1:
                    resStr = "红";
                    break;
                case 2:
                    resStr = "梅";
                    break;
                case 3:
                    resStr = "方";
                    break;
                case 4:
                    resStr = "王";
                    break;

            }
            print(ser, ['1B', '24']);
            var buff = bytes2Hexes([(j*100)%256,(j*100)/256]);
            print(ser,buff);
            var no = util.spacePad(3,i*5+j+1);
            print(ser,no+resStr);
        }
        print(ser,['0A']);
    }
    print(ser,['0A','0A']);
    print(ser,['1B','64','04','1B','69']);//cut

}
function pluginLoaded()
{
    console.log('loading finished!!!');
    ser = plugin().Serial;// Get a Serial object
    ser.open("COM1");// Open a port
    ser.set_option(9600,0,8,0,0);// Set port options
    ser.recv_callback(recv); // Callback function for recieve data
    pluginValid();
}

function pluginValid()
{
    if(plugin().valid){
        //alert(plugin().echo("This plugin seems to be working!"));
        console.log('the comm plugin work good :)');
        setInterval(checkPrinter,1000);
    } else {
        alert("Plugin is not working :(");
    }
}

//translate an array of byte(int) to an array of string which is an hex of int
// para: an array of byte
//return : an array of string
function bytes2Hexes(bytes){
    var res = [];
    for(var i = 0; i< bytes.length; i++){
        var ti = bytes[i];
        var ts = ti.toString(16);
        if(ti<16){
            ts = '0'+ts;
        }
        ts.toUpperCase();
        res.push(ts);
    }
    return res;
}

//translate an string to an array of int
// para: string
//return : an array of int which consponed to the string' code
function print(ser, content){
    //print an array of hex strings
    if(typeof(content) =='object') {
        var res = [];
        for (var i = 0; i < content.length; i++) {
            var ts = content[i];
            var ti = parseInt(ts, 16);
            res.push(ti);
        }
        for (var i = 0; i < res.length; i++) {
            ser.send(res[i]);
        }
    }

    //print string
    if(typeof(content) =='string'){
        var res = [];
        var str =UrlEncode(content);
        var strs = str.split('%');
        for(var i = 1; i < strs.length; i++){
            var ts = strs[i];
            var ti = parseInt(ts,16);
            res.push(ti);
        }
        for(var i = 0; i< res.length; i++){
            ser.send(res[i]);
        }

    }
}

