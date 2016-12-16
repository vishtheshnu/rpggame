var worldState = {
    
    fpsCounter: null,
    
    map: null,
    mapSaved: false,
    mapName: '',
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
        console.log('creating world');
        this.mapLoading = true;
        
        //Load starting map
        var self = this;
        
        //Set up arcade physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        console.log('loading map')
        if(this.mapName == ''){
            this.mapName = 'room3';
        }
        this.map = new tiledMapLoader(this.mapData[this.mapName], function(player, map){
            self.player = player;
            game.camera.follow(player);
            
            if(self.mapSaved){
                self.loadMapContents(map);
                self.mapSaved = false;
            }
            
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
        
        //update accessing inventory/quests/saving
        if(InputHandler.pause.clicked){
            console.log(this.player.body);
            this.saveMapContents();
            game.state.start('quests');
            
        }
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
            Player.directionFacing = 'left';
        }else if(InputHandler.right.pressed){
            pvel.x = this.playerSpeed;
            Player.directionFacing = 'right';
        }
        
        if(InputHandler.up.pressed){
            pvel.y = -this.playerSpeed;
            Player.directionFacing = 'up';
        }else if(InputHandler.down.pressed){
            pvel.y = this.playerSpeed;
            Player.directionFacing = 'down';
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
            var x = this.player.body.x+this.player.body.width/2;
            var y = this.player.body.y+this.player.body.height/2;
            var ts = this.map.tileSize;
            switch(Player.directionFacing){
                case 'left':    x -= ts; var x2 = x; var y2 = y%ts > ts/2 ? y+ts : y-ts; break;
                case 'right':   x += ts; var x2 = x; var y2 = y%ts > ts/2 ? y+ts : y-ts; break;
                case 'up':      y -= ts; var x2 = x%ts > ts/2 ? x+ts : x-ts; var y2 = y; break;
                case 'down':    y += ts; var x2 = x%ts > ts/2 ? x+ts : x-ts; var y2 = y; break;
            }
            
            for(var i = 0; i < this.map.eventGroup.children.length; i++){
                event = this.map.eventGroup.children[i];
                if(event.body.hitTest(x, y) || event.body.hitTest(x2, y2)){
                    this.triggerEvent(event.gameEventObject, event.x, event.y);
                    return;
                }
            }
            
            for(var i = 0; i < this.map.npcGroup.children.length; i++){
                npc = this.map.npcGroup.children[i];
                if(npc.body.hitTest(x, y) || npc.body.hitTest(x2, y2)){
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
    
    loadMap: function(mapName, warpID, x, y){
        //Initial setup
        this.mapLoading = true;
        
        var self = this;
        game.camera.onFadeComplete.addOnce(function(){
            self.map.delete();
            self.player.kill();
            this.mapName = mapName;
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
                
                //If loading from non-warp (eg. game load)
                if(x != undefined && y != undefined){
                    self.player.x = x;
                    self.player.y = y;
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
    
    /*Save & Load position of */
    
    savePlayer: {x: 0, y: 0},
    saveBounds: [],
    saveEvents: [],
    saveNPCs: [],
    
    saveMapContents: function(){
        //Reset Variables
        this.saveBounds = [];
        this.saveEvents = [];
        this.saveNPCs = [];
        
        //Save location of each entity to a variable
        this.savePlayer.x = this.player.x;
        this.savePlayer.y = this.player.y;
        for(var i = 0; i < this.map.collisionGroup.children.length; i++){
            var item = this.map.collisionGroup.children[i];
            this.saveBounds.push({x: item.body.x, y: item.body.y});
        }
        for(var i = 0; i < this.map.eventGroup.children.length; i++){
            var item = this.map.eventGroup.children[i];
            this.saveEvents.push({x: item.body.x, y: item.body.y});
        }
        for(var i = 0; i < this.map.npcGroup.children.length; i++){
            var item = this.map.npcGroup.children[i];
            this.saveNPCs.push({x: item.body.x, y: item.body.y});
        }
        console.log('Saved map: '+this.saveBounds.length+' collisions, '+this.saveEvents.length+' events, '+this.saveNPCs.length+' npcs');
        this.mapSaved = true;
    },
    
    loadMapContents: function(map){
        console.log('Loading map: '+this.map.collisionGroup.children.length+' collisions, '+this.map.eventGroup.children.length+' events, '
                    +this.map.npcGroup.children.length+' npcs');
        //Set location of each entity from saved variable
        this.player.x = this.savePlayer.x;
        this.player.y = this.savePlayer.y;
        for(var i = 0; i < this.map.collisionGroup.length; i++){
            var item = this.map.collisionGroup.children[i];
            item.x = this.saveBounds[i].x;
            item.y = this.saveBounds[i].y;
        }
        for(var i = 0; i < this.map.eventGroup.children.length; i++){
            var item = this.map.eventGroup.children[i];
            item.x = this.saveEvents[i].x;
            item.y = this.saveEvents[i].y;
        }
        for(var i = 0; i < this.map.npcGroup.children.length; i++){
            var item = this.map.npcGroup.children[i];
            item.x = this.saveNPCs[i].x;
            item.y = this.saveNPCs[i].y;
            console.log('npc set');
            console.log(item);
        }
    },
    
    mapData: {
        room3: {name: 'room3', tilesets:['tiles']},
        room2: {name: 'room2', tilesets:['tiles']},
        
    },
}