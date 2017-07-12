/**
 * Created by xingyongkang on 2017/5/27.
 */
var hallRoom = {};
//scene2 preloader

hallRoom.Preloader = {
    create: function () {
        game.load.onFileComplete.add(this.fileComplete, this);
        game.load.onLoadComplete.add(this.loadComplete, this);
        this.text = game.add.text(game.world.width / 2, game.world.height / 4, 'Start', {fill: '#000000'});
        this.text.anchor.set(0.5);
        this.start();

    },
    start: function () {

        //load
        //this.load.audio('music', 'assets/music.mp3');
        // game.load.image('cover','assets/cover.png');
        // game.load.atlas('ico', 'assets/ico.png?'+Math.random()*1000+'', 'assets/ico.json?'+Math.random()*1000+'');

        game.load.start();
    },
    fileComplete: function (progress) {
        this.text.setText(+progress + "%");
    },
    loadComplete: function () {
        this.text.setText("finish loading");
        console.log('start hallroom.enter');
        game.state.start('hallRoom.Enter');

        //this.state.start('Result');
    }
};


//scene2 conection

hallRoom.Enter = {
    create: function () {
        //game.add.image(0,0,'MainMenu');
        //game.bg = game.add.image(0,0,'gameBg');
        game.startBtn = GameUI.btn('game.startBtn', game.world.centerX, game.world.centerY, 'start-btn', 0.5, 1, function () {
            //game.state.start('Game')
            console.log('start game');

        });

        enterRoom();
        GameUI.cutscenes()
        layer.msg('start game');
    },
    update: function () {
        if (state == code.STATE.INIT) {
            while (true) {
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

        }
        else {

            if (state == code.STATE.READY) {
                console.log('************Enter Room ********');
                game.state.start('hallRoom.Game');
            }
        }
    }
};

hallRoom.Game = {


    create: function () {
        layer.msg('In game');
        this.startY = 0;
        this.rooms = {};
        this.scenes= {};
        this.sceneGroup = {};


        this.sceneGroup = game.add.group();
        this.sceneGroup.inputEnableChildren = true;
        //var item;
        this.scenesBmp = [];

        for (var i = 0; i < 6; i++) {
            this.scenesBmp[i] = game.make.bitmapData(720, 640);
            // scenesBmp[i].cls();
            // scenesBmp[i].fill(255,0,0,0);
            this.scenesBmp[i].draw('sceneBack', 0, 0);
            this.scenesBmp[i].text(i + 1, 10, 60, " 32px Arial", 'rgb(255,0,0)', true);
            this.item = this.sceneGroup.create(360, 640 * i, this.scenesBmp[i], i);

            this.item.id = i;
            this.item.anchor.setTo(0.5, 0);
            // Enable input detection, then it's possible be dragged.
            this.item.inputEnabled = true;

            // Make this item draggable.
            //item.input.enableDrag(false,true);
            this.item.input.enableDrag();

            // Limit drop location to only the 2 columns.
            this.item.events.onDragStart.add(this.dragStart);
            this.item.events.onDragUpdate.add(this.dragUpdate);
            this.item.events.onDragStop.add(this.dragStop);

        }

        this.sceneGroup.onChildInputDown.add(this.selected, this);



    },
    selected: function (sprite, pointer) {
        console.log('selected ' + sprite.id);
    },

    dragStart: function (sprite) {
        console.log('dragStart');
        this.startY = sprite.y;
    },

    dragUpdate: function (sprite, pointer, dragX, dragY, snapPoint) {
        console.log('dragupdate');
        // console.log(pointer);
        // console.log(snapPoint);
        // console.log(dragX);
        // console.log(dragY);

        (this.sceneGroup).forEach(function (item) {
            item.x = game.world.centerX;
            if (item != sprite) {
                item.y = (sprite.y - 640 * sprite.id) + item.id * 640;
            }

        });
    },

    dragStop: function (sprite) {

        if (Math.abs(sprite.y - this.startY) < 20) {
            var rid = sprite.roomID;
            window.localStorage.setItem('roomID', rid);
            console.log('roomID=' + rid);
            console.log('userType=' + userType);

            if (rid > 0 && (rooms[rid]['numOfUsers'] < rooms[rid]['maxNumOfUser'])) {
                return;
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
                if (rid <= 0) {
                    layer.msg('该机台尚未开通');
                }
                if (rooms[rid]['numOfUsers'] >= rooms[rid]['maxNumOfUser']) {
                    layer.msg('该机台人数已超过限制，请选择其它机台');
                }
            }
            return;
        }
        if (sprite.y > startY) {
            if (sprite.id > 0)
                sprite.y = startY + 640;
            else
                sprite.y = startY;
        }
        else {
            if (sprite.id < 5)
                sprite.y = startY - 640;
            else
                sprite.y = startY;
        }

        sceneGroup.forEach(function (item) {
            item.x = game.world.centerX;
            if (item != sprite) {
                item.y = (sprite.y - 640 * sprite.id) + item.id * 640;
            }

        });

    },

    update: function () {

        while (true) {
            var msg = msgQueue.shift();
            if (msg == undefined)
                break;
            switch (msg.command) {
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
                    break;
                    $('#balance').html('余分:' + msg.para[code.DATAINDEX.BALANCE]);

                    //$('#balance').html('<i class="icon-money "></i>' + '<font color="rgb(227,203,28)">'+msg.para[code.DATAINDEX.BALANCE])+'</font>';

                    break;
                case code.COMMAND.SHOWUSERS:
                    console.log(msg.para);
                    break;
                    $('#usersList').empty();
                    var s = $('<a class ="nuserList" href="#" ></a>').text('全体');
                    $('#usersList').append(s);

                    for (var user in msg.para) {
                        if (user == username) {
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

                    $('.nuserList').on('click', chat);


                    break;
                case code.COMMAND.SHOWROOMS:
                case code.COMMAND.SHOWSCENES:
                    if (msg.command == code.COMMAND.SHOWROOMS) {
                        //rooms = clone(msg.para);
                        this.rooms = msg.para;
                        for (var room in this.rooms)
                            this.rooms[room]['roomType'] = roomTypeString(this.rooms[room]['roomType']);
                    }
                    else {
                        this.scenes = msg.para;
                    }
                    var roomIndex = 0;
                    var offset = 55;
                    for (var room in this.rooms) {
                        if (this.scenes.hasOwnProperty(room)) {

                            this.sceneGroup.getAt(roomIndex)['roomID'] = this.rooms[room]['roomID'];
                            var curNo = this.scenes[room]['curNo'];
                            if (this.scenesBmp[roomIndex] != null) {
                                this.scenesBmp[roomIndex].cls();
                                this.scenesBmp[roomIndex].fill(255, 255, 255, 0);
                                this.scenesBmp[roomIndex].draw('sceneBack', 0, 0);
                                this.scenesBmp[roomIndex].text(roomIndex + 1, 20, offset, " 32px Arial", 'rgb(255,0,0)', true);
                                this.scenesBmp[roomIndex].text(this.rooms[room]['numOfUsers'] + '/' + this.rooms[room]['maxNumOfUser'], 650, offset, " 32px Arial", 'rgb(255,0,0)', true);
                                this.scenesBmp[roomIndex].text(this.scenes[room]['sceTime'].toString(), 200, 46 + offset, " 32px Arial", 'rgb(255,0,0)', true);
                                this.scenesBmp[roomIndex].text(this.scenes[room]['sceNo'].toString(), 45, 495 + offset, " 32px Arial", 'rgb(255,0,0)', true);
                                this.scenesBmp[roomIndex].text(this.scenes[room]['curNo'].toString(), 45, 535 + offset, " 32px Arial", 'rgb(255,0,0)', true);
                                var stat = [0, 0, 0, 0, 0];
                                for (var i = 0; i < curNo; i++) {
                                    stat[this.scenes[room][i.toString()]] = stat[this.scenes[room][i.toString()]] + 1;
                                    var icon = 'pokeicon' + this.scenes[room][i.toString()];
                                    this.scenesBmp[roomIndex].draw(icon, (i % 14) * 51 + 8, Phaser.Math.floorTo(i / 14) * 51 + 66 + offset, 40, 40);
                                }
                                for (var i = 0; i < 5; i++) {
                                    this.scenesBmp[roomIndex].text(stat[i], (i * 121) + 166, 575 + offset, "32px Arial", 'rgb(255,0,0)', true);
                                }
                            }
                            roomIndex++;
                        }
                    }
                    break;

                case code.COMMAND.SHOWROOMINFO:
                    break;
                    $('#roomName').html('<i class="icon-home icon-large "></i>' + roomTypeString(msg.para['roomType']) + ":" + msg.para['roomName'] + '    (' + '在线' + msg.para['numOfUsers'] + '人)');
                    break;
                case code.COMMAND.CHAT:
                    var blen = $("#messageBoard tr").length;
                    if (blen > 5) {
                        $("#messageBoard tr").eq(0).remove();
                    }
                    addMessage(msg.para.from, "", msg.para.message);
                    break;
                default:
                    //msgQueue.push(msg);
                    break;
            }
        }


        switch (state) {
            case code.STATE.READY:
                if (bIfFirstIn) {

                    //sendMsg({command: code.COMMAND.SHOWBETTING, para: 0});
                    //sendMsg({command: code.COMMAND.SHOWALLBETTING, para: 0});
                    //sendMsg({command: code.COMMAND.SHOWSCENE, para: 0});
                    sendMsg({command: code.COMMAND.SHOWUSERS, para: 0});
                    sendMsg({command: code.COMMAND.SHOWROOMS, para: 0});
                    sendMsg({command: code.COMMAND.SHOWROOMINFO, para: 0});
                    sendMsg({command: code.COMMAND.SHOWSCENES, para: 0});
                    bIfFirstIn = false;
                }
                break;
        }
    }
};
