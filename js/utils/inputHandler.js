var InputHandler = {
    keys: [],
    
    left: null,
    right: null,
    up: null,
    down: null,
    
    tapTime: 50,
    
    init: function(){
        var kb = Phaser.Keyboard;
        
        this.left = {
            key: kb.LEFT,       //corresponding keyboard key object
            pressed: false,     //true if currently pressed down
            clicked: false,     //true on first update loop of key being pressed
            tapped: false,      //true for first tapTime milliseconds of key being pressed
            timeElapsed: 0.0,   //how long key has been pressed, in milliseconds
        };
        
        this.right = {
            key: kb.RIGHT,
            pressed: false,
            clicked: false,
            tapped: false,
            timeElapsed: 0.0,
        };
        
        this.up = {
            key: kb.UP,
            pressed: false,
            clicked: false,
            tapped: false,
            timeElapsed: 0.0,
        };
        
        this.down = {
            key: kb.DOWN,
            pressed: false,
            clicked: false,
            tapped: false,
            timeElapsed: 0.0,
        };
        
        this.spacebar = {
            key: kb.SPACEBAR,
            pressed: false,
            clicked: false,
            tapped: false,
            timeElapsed: 0.0,
        };
        
        this.keys = [this.left, this.right, this.up, this.down, this.spacebar];
    },
    
    update: function(){
        
        delta = game.time.elapsedMS;
        kb = game.input.keyboard;
        
        for(var i = 0; i < this.keys.length; i++){
            if(kb.isDown(this.keys[i].key)){
                
                //Set clicked to false if after first loop of being pressed
                if(this.keys[i].clicked){
                    this.keys[i].clicked = false;
                }
                
                //Set pressed, clicked, & tapped to true
                if(!this.keys[i].pressed){
                    this.keys[i].pressed = true;
                    this.keys[i].clicked = true;
                    this.keys[i].tapped = true;
                    this.keys[i].timeElapsed = -delta;
                }
                
                //Set tapped to false if it's already true and tapped time > max tap time
                if(this.keys[i].tapped && this.keys[i].timeElapsed > this.tapTime)
                    this.keys[i].tapped = false;
                
                //Add time to elapsed key if it's pressed
                if(this.keys[i].pressed)
                    this.keys[i].timeElapsed += delta;
                
            }
            //Reset keyboard interaction booleans
            else{
                this.keys[i].pressed = false;
                this.keys[i].clicked = false;
                this.keys[i].tapped = false;
            }
        }
    },
    
}