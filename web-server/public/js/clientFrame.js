/**
 * Created by xingyongkang on 2017/5/23.
 */
var clientFrame = {};

//scene1 boot

clientFrame.Boot = {
    init : function(){

       // game.input.maxPointers = 1;
        game.stage.disableVisibilityChange = true;
        game.stage.backgroundColor = '#000000';
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.pageAlignHorizontally =  true;
        game.scale.pageAlignVertically = true;
        //game.scale.setScreenSize(true);
        //game.scale.forceLandscape = true;
        //layer.msg('clientFrame Boot');
    },
    preload: function() {
    },
    create: function() {
        //game.state.start('clientFrame.Preloader');
        console.log('start clientFrame.preloader');
    }
};


//scene2 preloader

clientFrame.Preloader =  {
    create:function(){
        game.load.onFileComplete.add(this.fileComplete, this);
        game.load.onLoadComplete.add(this.loadComplete, this);
        this.text = game.add.text(game.world.width/2, game.world.height/2, 'Start', { fill: '#000000' });
        this.text.anchor.set(0.5);
        this.start();
    },
    start:function(){

        //load
        //game.load.audio('music', 'assets/music.mp3');
       // game.load.image('cover','assets/cover.png');
       // game.load.atlas('ico', 'assets/ico.png?'+Math.random()*1000+'', 'assets/ico.json?'+Math.random()*1000+'');
        game.load.image('gameBg','assets/gameBg.jpg');
        game.load.atlas('ico', 'assets/ico.png?'+Math.random()*1000+'', 'assets/ico.json?'+Math.random()*1000+'');


        //for Hall
        game.load.image('sceneBack','assets/sceneBackSimple.png');
        for (var i = 0; i < 5; i++)
           game.load.image('pokeicon' + i, 'assets/pokeicon_0' + i + '.png');


        game.load.start();
    },
    fileComplete:function(progress){
        this.text.setText( + progress + "%");
    },
    loadComplete:function(){
        this.text.setText("finish loading");


      console.log('start hallroom.preloader');
      game.state.start('hallRoom.Preloader');
        layer.msg('call hall');
    }
};



