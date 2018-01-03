/**
 * Created by xingyongkang on 17/12/30.
 */
var reg = {};
function SliderState(){
    Phaser.State.call(this);
};
createSubClass(Phaser.State,SliderState);

//var SliderState = function (game) {};
//var slider;
// Load images and sounds
SliderState.prototype.preload = function () {
    this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    this.load.image('bg', './assets/WXHHDesktop.png');
    this.load.image("block1", "../assets/slider/pinkBlock.png");
    this.load.image("block2", "../assets/slider/blueBlock.png");
    this.load.image("block3", "../assets/slider/greenBlock.png");
    this.load.image("block4", "../assets/slider/yellowBlock.png");
    this.load.image("block5", "../assets/slider/purpleBlock.png");

    this.load.image("arrow1", "../assets/slider/arrow1.png");
    this.load.image("arrow2", "../assets/slider/arrow2.png");
    this.load.image("accept", "../assets/slider/stripe.png");
    this.load.image("box", "../assets/slider/box.png");
    this.load.image("cancel", "../assets/slider/cancel_paused.png");
    this.load.image("char1", "../assets/slider/char1.png");
    this.load.image("char2", "../assets/slider/char2.png");
    this.load.image("char3", "../assets/slider/char3.png");
    this.load.image("char4", "../assets/slider/char4.png");
    this.slider = new phaseSlider(this.game);

    //test ui
    // You can use your own methods of making the plugin publicly available. Setting it as a global variable is the easiest solution.
    this.slickUI = this.game.plugins.add(Phaser.Plugin.SlickUI);
    this.slickUI.load('assets/kenney-theme/kenney.json'); // Use sthe path to your kenney.json. This is the file that defines your theme.
    ///test ui
};

// Setup the example
SliderState.prototype.create = function () {
    // Set stage background to something sky colored
    this.game.stage.backgroundColor = 0xcdcdcd;
    this.add.image(0, 0, "bg");
    var char1 = this.game.add.image(0,0,"char1");
    var char2 = this.game.add.image(0,0,"char2");
    var char3 = this.game.add.image(0,0,"char3");
    var char4 = this.game.add.image(0,0,"char4");

    var group1 = this.game.add.group();
    group1.width = 500;
    group1.height = 400;
    char1.scale.setTo(0.5, 0.5);
    char1.x = 500/2 - char1.width/2;
    char1.y = 100;

    //////////
    var group2 = this.game.add.group();
    group2.width = 500;
    group2.height = 400;
    char2.scale.setTo(0.5, 0.5);
    char2.x = 500/2 - char2.width/2;
    char2.y = 100;
    ///////////
    var group3 = this.game.add.group();
    group3.width = 500;
    group3.height = 400;
    char3.scale.setTo(0.5, 0.5);
    char3.x = 500/2 - char3.width/2;
    char3.y = 100;
    ////////////
    var group4 = this.game.add.group();
    group4.width = 500;
    group4.height = 400;
    char4.scale.setTo(0.5, 0.5);
    char4.x = 500/2 - char4.width/2;
    char4.y = 100;



    var block1 = this.game.add.image(0,0,"block1");
    var block2 = this.game.add.image(0,0,"block2");
    var block3 = this.game.add.image(0,0,"block3");
    var block4 = this.game.add.image(0,0,"block4");

    group1.add(block1);
    group1.add(char1);
    /////
    group2.add(block2);
    group2.add(char2);
    /////
    group3.add(block3);
    group3.add(char3);
    /////
    group4.add(block4);
    group4.add(char4);


    this.slider.createSlider({
        customSliderBG: false,
        sliderBGAlpha: 0.5,
        x: this.game.width / 2 - 500 / 2,
        y: this.game.height / 2 - 400 / 2,
        customHandleNext: "arrow2",
        customHandlePrev: "arrow1",
        objects:[group1, group2, group3, group4],
        onNextCallback: function() {
            window.console.log("next");
        },
        onPrevCallback: function(){
            window.console.log("prev")
        }
    });

    var btn = this.game.add.image((this.game.width /2 - 80/2), (this.game.height / 2 - 80 / 2)+180, "accept");
    btn.inputEnabled = true;
    var that = this;
    btn.events.onInputDown.add(function (e, pointer) {
        var index = this.slider.getCurrentIndex();
        var text = this.game.add.text(0,0,"You selected -> ",{
            fontSize: 22,
            fill: "#1e1e1e"
        });
        text.updateText();

        text.x = this.game.height/2 - text.width/2;
        text.y = 80;

        var img = this.game.add.image(text.x+text.width+10, text.y-30, "char"+(index+1));
        img.scale.setTo(0.2, 0.2);

        new FloatingText(that.game, {
            text: "Hello Phaser!",
            animation: "explode",
            textOptions: {
                fontSize: 32,
                fill: "#ff18aa"
            },
            x: text.x,
            y: text.y,
            timeToLive: 200 // ms
        });


    },this);


    //test ui
    //var panel;
    this.slickUI.add(this.panel = new SlickUI.Element.Panel(8, 8, 500, this.game.height - 16));
    this.panel.add(this.button = new SlickUI.Element.Button(0,0, 140, 80));
    this.button.events.onInputUp.add(function () {console.log('Clicked button');});
    this.button.add(new SlickUI.Element.Text(0,0, "My button")).center();
    var textField = this.panel.add(new SlickUI.Element.TextField(10,58, this.panel.width - 20, 40, 7));
    textField.events.onOK.add(function () {
        alert('Your name is: ' + textField.value);
    });
    ///test ui
    //test Game Set UI
    //this.game.plugins.add(Phaser.Plugin.GameGui);

    ///Test Game set UI
    var that = this;
    this.game.input.onTap.addOnce(function(){
        that.game.state.start(
        'NewState', // The play state
        Phaser.Plugin.StateTransition.In.ScaleUp,
        Phaser.Plugin.StateTransition.Out.ScaleUp
    );
        console.log(Phaser.Plugin.StateTransition.In);
        console.log(Phaser.Plugin.StateTransition.Out);

})
};



// The update() method is called every frame
SliderState.prototype.update = function () {

};

