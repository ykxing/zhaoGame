/**
 * Created by xingyongkang on 2016/12/21.
 */


var sceneGroup;
var scenesBmp = [];
var startY;
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
