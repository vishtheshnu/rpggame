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
        //this.fpsCounter = game.add.text(0, 0, "FPS: "+0);
        //game.time.advancedTiming = true;
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
        moveX = this.player.x;
        moveY = this.player.y;
        dir = {x: 0, y: 0}; //slope of player movement
        ctc = []; //corners to check by indeces
        
        if(InputHandler.left.pressed){
            ctc.push(0); ctc.push(2);
            dir.x = -1;
            moveX -= Math.floor(this.map.tileSize * this.playerSpeed * game.time.elapsed / 1000);
        }else if(InputHandler.right.pressed){
            ctc.push(1); ctc.push(3);
            dir.x = 1;
            moveX += Math.floor(this.map.tileSize * this.playerSpeed * game.time.elapsed / 1000);
        }
        
        if(InputHandler.up.pressed){
            ctc.push(0); ctc.push(1);
            dir.y = -1;
            moveY -= Math.floor(this.map.tileSize * this.playerSpeed * game.time.elapsed / 1000);
        }else if(InputHandler.down.pressed){
            ctc.push(2); ctc.push(3);
            dir.y = 1;
            moveY += Math.floor(this.map.tileSize * this.playerSpeed * game.time.elapsed / 1000);
        }
        
        //console.log("movex = "+moveX+", movey = "+moveY);
        
        //Get 4 corners player intersects | 0, 1 | 2, 3
        var ts = this.map.tileSize;
        corners = [this.pixelToCoord(this.player.x, this.player.y),     this.pixelToCoord(this.player.x+ts, this.player.y),
                   this.pixelToCoord(this.player.x, this.player.y+ts),  this.pixelToCoord(this.player.x+ts, this.player.y+ts)];
        cornersX = [this.player.x, this.player.x+ts, this.player.x, this.player.x+ts];
        cornersY = [this.player.y, this.player.y, this.player.y+ts, this.player.y+ts];
        //Check if there's collision
        for(var i = 0; i < ctc.length; i++){
            pos = {x: cornersX[ctc[i]], y: cornersY[ctc[i]],}; //corners[ctc[i]];
            coord = this.pixelToCoord(pos.x, pos.y);
            console.log(pos.x + " , "+pos.y);
            if(this.map.collision[coord.x][coord.y] == true || this.map.npcGrid[coord.x][coord.y] != null){
                //collision found: move back in direction player is moving in
                console.log("collision found, "+ctc[i]);
                
                //calc how far out of bounds in each plane the player is
                modlocx = 0; modlocy = 0;
                if(dir.x != 0){
                    modlocx = ((pos.x%ts)*dir.x);//dir.x * (pos.x % this.map.tileSize + 1);
                    if(modlocx < 0){
                        modlocx += ts;
                        modlocx *= dir.x;
                    }
                }
                if(dir.y != 0){
                    modlocy = ((pos.y%ts)*dir.y);//dir.y * (pos.y % this.map.tileSize + 1);
                    if(modlocy < 0){
                        modlocy += ts;
                        modlocy *= dir.y;
                    }
                }
                
                //If diagonal movement, calc value to actually move
                if(modlocx != 0 && modlocy != 0){
                    if(Math.abs(modlocx) < Math.abs(modlocy)){
                        modlocy = 0;
                    }else{
                        modlocx = 0;
                    }
                }
                
                //Modify move to location to be outside collision box
                moveX -= modlocx;
                moveY -= modlocy;
                console.log("new loc: "+moveX+" , "+moveY);
                break;
            }
        }
        
        
        
        /*
        var eventToTrigger = null;
        
        //Check if corners are different from old corners
        if(!this.pixelToCoord(this.player.x, this.player.y).equals(this.pixelToCoord(moveX, moveY))){
            //find new corners
            var nc = true;
            for(var i = 0; i < corners.length; i++){
                for(var j = 0; j < this.playerCorners.length; i++){
                    if(corners[i].equals(this.playerCorners[j])){
                        nc = false;
                    }
                }
                if(nc){ //new corner found for corners[i]
                    //if new corner has step on event, record it and break
                    eventToTrigger = this.map.eventGrid[corners[i].x][corners[i].y];
                    if(eventToTrigger != null)
                        break;
                }
                nc = true;
            }
        }
        */
        
        //Move player
        this.player.x = moveX;
        this.player.y = moveY;
        
        //Trigger event if center position has changed
        com = this.pixelToCoord(this.player.x + this.map.tileSize/2, this.player.y + this.map.tileSize/2); //player's center
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
        {name: 'room2', tilesets:['tiles']},
        {name: 'room3', tilesets:['tiles']},
        
    ],
}