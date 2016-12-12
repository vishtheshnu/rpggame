var worldState = {
    
    fpsCounter: null,
    
    map: null,
    mapLoading: true,
    eventActive: false,
    eventEnding: false,
    
    player: null,
    playerSpeed: 10,
    playerCorners: [],
    playerCenterCoord: {x: 0, y: 0},
    
    preload: function(){game.time.advancedTiming = true;},
    
    create: function(){
        //Set up arcade physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //Load starting map
        var self = this;
        this.map = new tiledMapLoader(this.mapData[0], function(player, map){
            self.player = player;
            game.camera.follow(player);
            self.mapLoading = false;
        });
        
    },
    
    render: function(){
        game.debug.text(game.time.fps, 2, 14);
    },
    
    update: function(){
        if(this.mapLoading)
            return;
        
        InputHandler.update();
        //if event active, return
        //update player direction facing
        //update player movement
        this.updatePlayerMovement();
        //update player select
    },
    
    updatePlayerDirection: function(){
        if(InputHandler.left.tapped){
            Player.directionFacing = 'left';
        }else if(InputHandler.right.tapped){
            Player.directionFacing = 'right';
        }else if(InputHandler.up.tapped){
            Player.directionFacing = 'up';
        }else if(InputHandler.down.tapped){
            Player.directionFacing = 'down';
        }
    },
    
    updatePlayerMovement: function(){
        //Arcade Physics
        game.physics.arcade.collide(this.player, this.map.collisionGroup);
        game.physics.arcade.collide(this.player, this.map.npcGroup);
        
        var pvel = this.player.body.velocity;
        pvel.x = 0;
        pvel.y = 0;
        if(InputHandler.left.pressed){
            pvel.x = -100;
        }else if(InputHandler.right.pressed){
            pvel.x = 100;
        }
        
        if(InputHandler.up.pressed){
            pvel.y = -100;
        }else if(InputHandler.down.pressed){
            pvel.y = 100;
        }
        
        //Trigger event if center position has changed
        com = this.pixelToCoord(this.player.body.x + this.map.tileSize/2, this.player.body.y + this.map.tileSize/2); //player's center
        if(!com.equals(this.playerCenterCoord)){
            this.playerCenterCoord = com;
            evt = this.map.eventGrid[com.x][com.y];
            if(evt != null && (evt.type == 'script' || evt.type == 'warp'))
                this.triggerEvent(evt, com.x, com.y);
        }
        
    },
    
    updatePlayerSelection: function(){
        
    },
    
    triggerEvent: function(event, x, y){
        this.eventActive = true;
    },
    
    /*Helper Functions*/
    pixelToCoord: function(x, y){
        return {x: Math.floor(x/this.map.tileSize), y: Math.floor(y/this.map.tileSize), 
                equals: function(coord){return this.x == coord.x && this.y == coord.y;}
               };
    },
    
    gridSpace: function(arr, coords){
        return arr[coords.x][coords.y];
    },
    
    mapData: [
        {name: 'room3', tilesets:['tiles']},
        {name: 'room2', tilesets:['tiles']},
        
    ],
}