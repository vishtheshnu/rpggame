var worldState = {
    
    fpsCounter: null,
    
    map: null,
    mapLoading: true,
    eventLastActivated: null,
    eventActive: false,
    eventEnding: false,
    
    player: null,
    playerSpeed: 100,
    playerCorners: [],
    playerCenterCoord: {x: 0, y: 0},
    
    preload: function(){game.time.advancedTiming = true;},
    
    create: function(){
        //Set up arcade physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //Load starting map
        var self = this;
        this.map = new tiledMapLoader(this.mapData['room3'], function(player, map){
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
        Dialogs.update();
        
        if(this.eventEnding){
            this.eventEnding = false;
            this.eventActive = false;
            return;
        }
        if(this.eventActive)
            return;
        //if event active, return
        //update player direction facing
        this.updatePlayerDirection();
        //update player movement
        this.updatePlayerMovement();
        //update player select
        this.updatePlayerSelection();
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
            pvel.x = -this.playerSpeed;
        }else if(InputHandler.right.pressed){
            pvel.x = this.playerSpeed;
        }
        
        if(InputHandler.up.pressed){
            pvel.y = -this.playerSpeed;
        }else if(InputHandler.down.pressed){
            pvel.y = this.playerSpeed;
        }
        
        /*
        //Trigger event if center position has changed
        com = this.pixelToCoord(this.player.body.x + this.map.tileSize/2, this.player.body.y + this.map.tileSize/2); //player's center
        if(!com.equals(this.playerCenterCoord)){
            this.playerCenterCoord = com;
            evt = this.map.eventGrid[com.x][com.y];
            if(evt != null && (evt.type == 'script' || evt.type == 'warp'))
                this.triggerEvent(evt, com.x, com.y);
        }
        */
        
        //Check for event overlap
        var isOverlap = game.physics.arcade.overlap(this.player, this.map.eventGroup, function(player, event){
            //console.log(event == this.eventLastActivated);
            if(event == this.eventLastActivated)
                return;
            if(event.gameEventObject.type == 'activate'){
                return;
            }
            //Activate event
            this.eventLastActivated = event;
            this.triggerEvent(event.gameEventObject, event.x, event.y);
        }, null, this);
        if(!isOverlap)
            this.eventLastActivated = null;
        
    },
    
    updatePlayerSelection: function(){
        if(InputHandler.spacebar.clicked){
            x = this.player.body.x+this.player.body.width/2;
            y = this.player.body.y+this.player.body.height/2;
            switch(Player.directionFacing){
                case 'left':    x -= this.map.tileSize; break;
                case 'right':   x += this.map.tileSize; break;
                case 'up':      y -= this.map.tileSize; break;
                case 'down':    y += this.map.tileSize; break;
            }
            
            for(var i = 0; i < this.map.eventGroup.children.length; i++){
                event = this.map.eventGroup.children[i];
                if(event.body.hitTest(x, y)){
                    this.triggerEvent(event.gameEventObject, event.x, event.y);
                    return;
                }
            }
            
            for(var i = 0; i < this.map.npcGroup.children.length; i++){
                npc = this.map.npcGroup.children[i];
                if(npc.body.hitTest(x, y)){
                    console.log('script: '+npc.script);
                    this.triggerEvent(npc, event.x, event.y);
                    return;
                }
            }
        }
    },
    
    triggerEvent: function(event, x, y){
        //console.log("Event Triggered!");
        //console.log(event);
        this.eventActive = true;
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        switch(event.type){
            case 'warp': 
                this.loadMap(event.destinationRoom, event.destinationID);
                break;
            case 'script': 
                Scripts[event.script](this, x, y);
                break;
            case 'activate': 
                Scripts[event.script](this, x, y);
                break;
            case 'npc':
                Scripts[event.script](this, event);
                break;
                
        }
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
    
    isSpaceEmpty: function(x, y){
        collision = this.map.collisionGroup.children;
        for(var i = 0; i < collision.length; i++){
            if(collision[i].body.hitTest(x, y)){
                console.log('collision with ');
                console.log(collision[i]);
                return false;
            }
        }
        
        npcs = this.map.npcGroup.children;
        for(var i = 0; i < npcs.length; i++){
            if(npcs[i].body.hitTest(x, y)){
                console.log('collision with ');
                console.log(npcs[i]);
                return false;
            }
        }
        
        console.log('space is empty');
        return true;
    },
    
    loadMap: function(mapName, warpID){
        //Initial setup
        this.mapLoading = true;
        
        var self = this;
        game.camera.onFadeComplete.addOnce(function(){
            self.map.delete();
            self.player.kill();
            self.map = new tiledMapLoader(this.mapData[mapName], function(player, map){
                self.player = player;
                for(var i = 0; i < map.eventGroup.children.length; i++){
                    event = map.eventGroup.children[i];
                    if(event.gameEventObject.type == 'warp' && event.gameEventObject.id == warpID){
                        console.log('warp id found! '+event.body.x+' , '+event.body.y);
                        self.player.x = event.body.x;
                        self.player.y = event.body.y;
                        console.log('player location: '+self.player.x+' , '+self.player.y);
                        self.eventLastActivated = event;
                        break;
                    }
                }

                //camera fade in
                game.camera.flash(0x000000, 200);

                //Complete event
                self.mapLoading = false;
                self.eventEnding = true;
            });
        }, this);
        
        //camera fade out
        game.camera.fade(0x000000, 200);
        
    },
    
    mapData: {
        room3: {name: 'room3', tilesets:['tiles']},
        room2: {name: 'room2', tilesets:['tiles']},
        
    },
}