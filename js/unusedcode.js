/*
        //Manual
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
        
        //Move player
        this.player.x = moveX;
        this.player.y = moveY;
        
        */