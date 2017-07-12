/**
 * Created by xingyongkang on 2017/3/1.
 */
/**
 * Created by xingyongkang on 2016/12/21.
 */


function preload() {
    //game.load.spritesheet('button', 'assets/flixel-button.png',80,20);
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

    //game.stage.backgroundColor = '#00ffff';

    game.stage.backgroundColor = '#ffffff';

    //	You can listen for each of these events from Phaser.Loader
    game.load.onLoadStart.add(loadStart, this);
    game.load.onFileComplete.add(fileComplete, this);
    game.load.onLoadComplete.add(loadComplete, this);


    loadingText = game.add.text(50,100, "点击屏幕开始装载\nPress to Loading ", { font: "32px Arial", fill: "#ff0044", wordWrap: true, wordWrapWidth: 500, align: "left"});
    loadingText.anchor.set(0.0);

    setTimeout(loadFiles(),1);
    //setTimeout(actionOnClickFullScreen,1);
    //game.input.onTap.addOnce(actionOnClickFullScreen,this);
}
function loadFiles()
{
    if(bIfLoadingFinish == true)
        return;
    //game.load.image('space', 'assets/rain.png');
    // game.load.image('desktop', 'assets/desktop1.png');
    //game.load.image('textCurNo','assets/textCurNo.png');
    //game.load.image('textSceneNo','assets/textSceneNo.png');

    game.load.image('sceneBack','assets/sceneBack.png');
    for(var i = 0;i<7; i++) {
        switch (i) {
            case 5:
                game.load.spritesheet('btn' + i, 'assets/btn_0' + i + '.png', 168, 70);
                break;
            case 6:
                game.load.spritesheet('btn' + i, 'assets/btn_0' + i + '.png', 160, 65);
                break;
            default:
                game.load.spritesheet('btn' + i, 'assets/btn_0' + i + '.png', 160, 160);
                break;
        }
    }
    for(var i = 0;i<4; i++)
        game.load.image('btnSystem'+i,'assets/btnSystem'+i+'.png');
    for(var i = 0; i<5; i++)
        game.load.image('pokeicon'+i,'assets/pokeicon_0'+i+'.png');

    game.load.image('clock','assets/clock.png');

    //game.load.bitmapFont('carrier', 'assets/carrier_command.png', 'assets/carrier_command.xml');

    for(var i = 0; i<55; i++)
        game.load.image('card'+i, 'assets/pokes/'+i.toString()+'.png');
    game.load.image('avatar','assets/avatar.png');

    //load audio
    game.load.audio('backMusic',['assets/1.mp3','assets/1.ogg']);
    game.load.audio('sfx',['assets/magical.mp3','assets/magical.ogg']);
    for(var i = 54; i<58; i++){
        game.load.audio('audio'+(i-54).toString(),'assets/audio/'+i.toString()+'.wav');
    }
    game.load.audio('fx',['assets/fx_mixdown.ogg','assets/fx_mixdown.mp3']);

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

    fx = game.add.audio('fx');
    fx.addMarker('alien death', 1, 1.0);
    fx.addMarker('boss hit', 3, 0.5);
    fx.addMarker('escape', 4, 3.2);
    fx.addMarker('meow', 8, 0.5);
    fx.addMarker('numkey', 9, 0.1);
    fx.addMarker('ping', 10, 1.0);
    fx.addMarker('death', 12, 4.2);
    fx.addMarker('shot', 17, 1.0);
    fx.addMarker('squit', 19, 0.3);

    sfx = game.add.audio('sfx');
    //sfx.allowMultiple = false;
    sfx.addMarker('charm', 0, 2.7);
    sfx.addMarker('curse', 4, 2.9);
    sfx.addMarker('fireball', 8, 5.2);
    sfx.addMarker('spell', 14, 4.7);
    sfx.addMarker('soundscape', 20, 18.8);
    for(var i = 0; i<5; i++)
        audios.push(game.add.audio('audio'+i.toString()));

    music= game.add.audio('backMusic');
    music.onStop.add(onMusicStop,this);
    music.play();




    game.add.sprite(0,0,'sceneBack');
    sceneBmp = game.make.bitmapData(720,587);
    sceneBmp.addToWorld(360,0).anchor.setTo(0.5,0);


    paddingBmp = game.make.bitmapData(720,530);
    paddingBmp.fill(193,210,240,1);
    paddingBmp.addToWorld(360,640).anchor.setTo(0.5,0);


    allBettingGroup = game.add.group();
    for(var i = 0; i<5; i++) {
         var ttext = game.make.text(118 * i + 130, 595, "88888", {
            font: "40px Arial",
            fill: "rgb(238,199,16)",
            wordWrap: true,
            wordWrapWidth: 400,
            align: "left"
        });
        allBettingGroup.add(ttext);
    }
    allBettingGroup.x = 0;
    allBettingGroup.y = 0;

    var pos=[
        {x:0,y:0},
        {x:170,y:0},
        {x:0,y:170},
        {x:170,y:170},
        {x:170,y:340},
        {x:-4,y:340},
        {x:0,y:420}];

    btnGroup = game.add.group();
    btnGroup.inputEnableChildren = true;
    for(var i = 0; i<7; i++) {
        var sprTemp = game.make.button(pos[i]['x'],pos[i]['y'], 'btn'+i,actionOnClick,this, 1, 1, 1,0);
        sprTemp.name = "btn" + i;
        btnGroup.add(sprTemp);
    }
    btnGroup.x = 380;
    btnGroup.y = 655;
    btnGroup.onChildInputDown.add(onBtnGroupDown,this);



    bettingGroup = game.add.group();
    for(var i = 0; i<6; i++) {
        var ttext = game.make.text(pos[i]['x'],pos[i]['y']-5, "0000", {
                font: "40px Arial",
                fill: "rgb(238,199,16)",
                wordWrap: true,
                wordWrapWidth: 400,
                align: "left"
            });

        bettingGroup.add(ttext);
    }
    bettingGroup.x = 390;
    bettingGroup.y = 680;

    sCardName = 'card'+ Phaser.Math.between(0,54);
    card1 = game.add.sprite(160,900,sCardName);
    card1.anchor.setTo(0.5,0.5);
    card1.scale.setTo(0.8,0.8);

    cardBack = game.add.sprite(160,900,'card54');
    cardBack.anchor.setTo(0.5,0.5);
    cardBack.scale.setTo(0.8,0.8);

    clockBmp = game.make.bitmapData(120,137);
    clockSprite = game.add.sprite(160,-100,clockBmp);
    clockSprite.anchor.setTo(0.5,0.5);

    text = game.add.text(0, -100, "Init....", { font: "48px Arial", fill: "#ff0044", wordWrap: true, wordWrapWidth: 600, align: "left"});
    text.anchor.set(0.0);
    //startTween(text);

    //game.input.onTap.add(onTap,this);

    // game.scale.setGameSize(480,850);

    loadingText.text = '';
    checkList.loaded = true;

}

function actionOnClick () {

    //background.visible =! background.visible;

}

function onMusicStop(curMusic)
{
    curMusic.play();
}
function onTap(pointer ,doubleTap)
{
    var tx = game.input.mousePointer.worldX;//.clientX;
    var ty = game.input.mousePointer.worldY;//.clientY;
    console.log(Math.floor(tx).toString() + ':' + Math.floor(ty).toString() + '->' + game.input.mousePointer.clientX.toString()+":"+game.input.mousePointer.clientY.toString());

}


function onUserGroupDown(item)
{

    selectedUser = item.text;
    userGroup.forEach(function(pitem){
        if(pitem === item)
        {
            item.tint = 0xee0000;
        }
        else
            pitem.tint = 0xffffff;
    });

}

function onBtnSystemGroupDown(sprite)
{
    switch (sprite.name) {
        case "btnSystem0":
            console.log('btnSystem0');
            if (game.scale.isFullScreen) {
                game.scale.stopFullScreen();
            }
            else {
                game.scale.startFullScreen(false);
            }

            break;
        case "btnSystem1":
            console.log('btnSystem1');
            break;
        case "btnSystem2":
            console.log('btnSystem2');
            break;
        case "btnSystem3":
            // console.log('btnSystem1');
            window.location.href='/';
            //window.close();
            break;
    }

}
function onBtnGroupDown(sprite)
{

    //sprite.tint = 0x00ff00;
    if(sprite.name == 'btn5')
    {
        fx.play('ping');
        sendMsg({command: code.COMMAND.OPERATE, para: 5});
    }
    else {
        if (state == code.STATE.BETTING) {
            fx.play('ping');
            switch (sprite.name) {
                case "btn0":
                    sendMsg({command: code.COMMAND.OPERATE, para: 0});
                    break;
                case "btn1":
                    sendMsg({command: code.COMMAND.OPERATE, para: 1});
                    break;
                case "btn2":
                    sendMsg({command: code.COMMAND.OPERATE, para: 2});
                    break;
                case "btn3":
                    sendMsg({command: code.COMMAND.OPERATE, para: 3});
                    break;
                case "btn4":
                    sendMsg({command: code.COMMAND.OPERATE, para: 4});
                    break;

            }
        }
    }
}
function setPlay() {
    console.log('require for  play');
    sendMsg({command: code.COMMAND.LIVESTREAM, para: 0});
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
        /*
        if(! checkList.sayHello ){
            if(checkList.connected) {
                game.time.events.add(1000,function(){
                    if(!checkList.sayHello && checkList.connected){
                        console.log('say hello again');
                        sendMsg({command: code.COMMAND.HELLO, para: 1});
                    }

                },this);
            }
        }

        if (checkList.connected && checkList.loaded && checkList.sayHello) {
            state = code.STATE.READY;
            //$('#userName').text(username);
           // $('#userName').html('<i class="icon-user icon-large"></i>' + userTypeString(storage('userType')) + ":" + username);
            if(text != null)
                text.text = "Ready";
            noSleep = new NoSleep();
            noSleep.enable();

        }
        else{
            //console.log(checkList);
            if(text != null) {
                text.text = "connection:"+checkList.connected+";Loading:"+checkList.loaded+";sayHi:"+checkList.sayHello;
            }
            return;
        }
        */
        return;
    }

    var curDate = new Date();
    //console.log((curDate.getTime() - printerLastResponseTime.getTime()));
    if((curDate.getTime() - printerLastResponseTime.getTime())>3000){
        if(printerState == true)
        {
            printerState = false;
            sendMsg({command: code.COMMAND.CHECKPRINTER, para: 0});
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
            case code.COMMAND.SHOWRESULT:
                winColor = msg.para['winColor'];
                state = code.STATE.ANOUNCERESULT;
                bIfFirstIn = true;
                break;
            case code.COMMAND.SHOWTIME:
                clock = msg.para;
                if(clockBmp != null) {
                    clockBmp.fill(0, 0, 0, 0.0);
                    clockBmp.draw('clock',0,0,120,137,'');
                    var sClock = clock.toString();
                    if(clock<10)
                        sClock = '0'+ clock.toString();
                    clockBmp.text(sClock, 60-20, 68+20, "40px Arial", 'rgb(227,203,28)', true);
                }
                break;
            case code.COMMAND.SHOWALLBETTING:
                for (var i = 0; i < 5; i++) {
                    allBettingGroup.getAt(i).text = msg.para[i];
                }

                break;
            case code.COMMAND.UPSCORE:
                layer.msg(msg.para);
                break;
            case code.COMMAND.SHOWBETTING:
                for (var i = 0; i < 5; i++) {
                    bettingGroup.getAt(i).text = msg.para[code.DATAINDEX.BETSTART+i];
                    if(state == code.STATE.CELEBRATE){
                           var winScore = parseInt(bettingGroup.getAt(i).text);
                            if(winScore > 0){
                                audios[3].play();
                                layer.msg('赢得'+winScore+"分");
                            }
                    }
                }
                bettingGroup.getAt(i).text = msg.para[code.DATAINDEX.SWITCHUNIT];

                $('#balance').html('余分:' + msg.para[code.DATAINDEX.BALANCE]);

                //$('#balance').html('<i class="icon-money "></i>' + '<font color="rgb(227,203,28)">'+msg.para[code.DATAINDEX.BALANCE])+'</font>';

                break;
            case code.COMMAND.SHOWROOMINFO:
                $('#roomName').html('<i class="icon-home icon-large"></i>' + msg.para['roomName']+'    ('+'在线'+msg.para['numOfUsers']+'人)' );
                break;
            case code.COMMAND.SHOWUSERS:

                $('#usersList').empty();
                var s = $('<a class ="nuserList" href="#" ></a>').text('全体');
                $('#usersList').append(s);

                for(var user in msg.para) {
                    if(user == username){
                        //$('#balance').html('<i class="icon-money "></i>' + msg.para[user][code.DATAINDEX.BALANCE]);
                        $('#balance').html('余分:' + msg.para[user][code.DATAINDEX.BALANCE]);
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
            case code.COMMAND.SHOWSCENE:
                var curNo = msg.para['curNo'];
                if(sceneBmp != null) {
                    sceneBmp.cls();
                    sceneBmp.fill(255,255,255,0);
                    //sceneBmp.draw(div,0,0);
                    sceneBmp.text(msg.para['sceTime'].toString(),200,46," 32px Arial",'rgb(255,0,0)',true);
                    sceneBmp.text(msg.para['sceNo'].toString(),45,495," 32px Arial",'rgb(255,0,0)',true);
                    sceneBmp.text(msg.para['curNo'].toString(),45,535," 32px Arial",'rgb(255,0,0)',true);
                    var stat = [0,0,0,0,0];
                    for (var i = 0; i < curNo; i++) {
                        stat[msg.para[i.toString()]] = stat[msg.para[i.toString()]] + 1;
                        var icon = 'pokeicon' + msg.para[i.toString()];
                        sceneBmp.draw(icon,(i % 14) * 51+8, Phaser.Math.floorTo(i / 14) * 51+66,40,40);
                    }
                    for(var i = 0 ; i<5; i++){
                        sceneBmp.text(stat[i],(i*121)+166,575,"32px Arial",'rgb(255,0,0)',true);
                    }
                    //sceneBmp.draw('textKJJL',5,50,40,300);
                }

                break;
            case code.COMMAND.PRINTSCENE:
                if(plugin().valid)
                    printScene(msg.para);
                break;
            case code.COMMAND.UNLOCK:
                console.log('unLock');
                if(plugin().valid)
                    unlock();
                break;
            case code.COMMAND.CHAT:
                var blen = $("#messageBoard tr").length;
                if(blen >5){
                    $("#messageBoard tr").eq(0).remove();
                }
                addMessage(msg.para.from,"",msg.para.message);
                break;
            case code.COMMAND.LIVESTREAM:
                /*
                console.log('start play');
                console.log(msg.para);
                var ds =[{type:"rtmp/flv",src: msg.para['rtmpPullUrl']},{type: "video/x-flv",src: msg.para['httpPullUrl']},{type: "application/x-mpegURL",src:msg.para['hlsPullUrl']}];
                myPlayer1 = neplayer('my-video1');
                myPlayer1.setDataSource(ds);
                myPlayer1.play();
                */

                /*
                 myPlayer.setDataSource([{type:"rtmp/flv",src:"rtmp://vd91d2902.live.126.net/live/f442563e7d814ff2aa832c0be10aa91f"},
                 {type: "video/x-flv",src: "http://flvd91d2902.live.126.net/live/f442563e7d814ff2aa832c0be10aa91f.flv?netease=flvd91d2902.live.126.net"},
                 {type: "application/x-mpegURL",src: "http://pullhlsd91d2902.live.126.net/live/f442563e7d814ff2aa832c0be10aa91f/playlist.m3u8"}

                 ]);

                 myPlayer.play();
                 */
                break;
            default:
                //msgQueue.push(msg);
                break;
        }
    }
    switch(state) {
        case code.STATE.READY:
            if(bIfFirstIn) {

                sendMsg({command: code.COMMAND.SHOWBETTING, para: 0});
                sendMsg({command: code.COMMAND.SHOWALLBETTING, para: 0});
                sendMsg({command: code.COMMAND.SHOWSCENE, para: 0});
                sendMsg({command: code.COMMAND.SHOWUSERS, para: 0});
                sendMsg({command: code.COMMAND.SHOWROOMINFO, para: 0});
                bIfFirstIn =false;
            }
            break;
        case code.STATE.GENERATESCENE:
            if(bIfFirstIn)
            {
                layer.msg('正在生成新的路单');
                bIfFirstIn = false;
            }
            break;
        case code.STATE.STARTBETTING:
            if(bIfFirstIn)
            {
                audios[0].play();
                game.add.tween(clockSprite).to({ y:900}, 2000, Phaser.Easing.Bounce.Out,true);
                bIfFirstIn = false;

            }
            break;
        case code.STATE.BETTING:
            if(bIfFirstIn) {
               /* btnGroup.forEach(function(item){
                    item.tint = 0xff0000;
                });
                */
                layer.msg('开始押分');
                bIfFirstIn =false;
            }

            break;
        case code.STATE.STOPBETTING:
            if(bIfFirstIn) {
                /*
                btnGroup.forEach(function(item){
                    item.tint = 0xffffff;
                });
                */
                layer.msg('停止押分');
                audios[1].play();
                sfx.play('charm');
                game.add.tween(clockSprite).to({ y:-100}, 2000, Phaser.Easing.Bounce.In,true);
                bIfFirstIn =false;
            }

            break;
        case code.STATE.ANOUNCERESULT:
            if(bIfFirstIn) {
                card1.loadTexture('card'+winColor.toString());
                //game.add.tween(cardBack).to({ y: -300 }, 3000, Phaser.Easing.Back.In,true);
                game.add.tween(cardBack).to({ y: -250 }, 3000, Phaser.Easing.Exponential.In,true);
                bIfFirstIn = false;
            }
            break;
        case code.STATE.CELEBRATE:
            if(bIfFirstIn) {

                bIfFirstIn = false;
            }
            break;
        case code.STATE.CLEAR:
            if(bIfFirstIn) {
                //game.add.tween(cardBack).to({alpha: 1.0}, 1000, Phaser.Easing.Exponential.In, true);
                game.add.tween(cardBack).to({ y: 900 }, 2000, Phaser.Easing.Bounce.Out,true);
                bIfFirstIn = false;
            }

            break;
        case code.STATE.CHECKSCENE:
            if(bIfFirstIn)
            {
                audios[2].play();
                layer.msg("请您对单");

                game.add.tween(clockSprite).to({ y:400}, 1000, Phaser.Easing.Bounce.Out,true);
                bIfFirstIn = false;
                //setTimeout(sendToPrinter,1);
            }
            break;
    }

}
function render(){
    /*
     game.debug.pointer(game.input.mousePointer);
     game.debug.pointer(game.input.pointer1);
     game.debug.pointer(game.input.pointer2);
     */
    //console.log(game.input.mousePointer.clientX,game.input.mousePointer.clientY);
    //game.debug.text('ESC to leave fullscreen', 300, 550);
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
    if(!wakeLockEnabled ) {
        noSleep.enable();
        wakeLockEnabled = true;
    }
    loadFiles();
}

function startTween(item) {

    //ball.y = 0;

    var bounce=game.add.tween(item);
    switch(item)
    {
        case clockBmp:
            bounce.to({ x: 300, y: 400}, 2000, Phaser.Easing.Bounce.In,false,0,0,true);
            break;
        default:
            bounce.from({ x: 720 }, 3000, Phaser.Easing.Bounce.Out,false,0,0,true);
            bounce.onComplete.add(startTween, this);
            break;
    }
    bounce.start();

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



