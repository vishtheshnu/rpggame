var menuPanelInventory = {
    
    container: null,
    itemSprites: [],
    filledText: null,
    infoText: null,
    dropButton: null,
    isItemSelected: false,
    itemSelected: -1,
    
    itemDragged: null,
    itemDraggedLoc: null,
    
    SPRITE_WIDTH: 50,
    SPRITE_HEIGHT: 50,
    WIDTH: 5,
    HEIGHT: 9,
    
    create: function(x, y, width, height){
        //Reset changing vars
        this.itemSelected = -1;
        this.isItemSelected = false;
        this.itemDragged = null;
        this.itemDraggedLoc = null;
        
        this.container = game.add.group();
        this.container.fixedToCamera = true;
        this.x = x; this.y = y; this.width = width; this.height = height;
        
        //Fill itemSprites with contents of inventory
        for(var i = 0; i < this.WIDTH; i++){
            var col = [];
            for(var j = 0; j < this.HEIGHT; j++){
                var item = Player.Inventory.items[i*this.HEIGHT+j];
                if(item != null){
                    var sprite = game.add.sprite(x+this.SPRITE_WIDTH*i, y+this.SPRITE_HEIGHT*j, 'items', item.spriteIndex);
                    sprite.width = this.SPRITE_WIDTH;
                    sprite.height = this.SPRITE_HEIGHT;
                    sprite.inputEnabled = true;
                    sprite.events.onInputOver.add(this.displayInfo, this);
                    sprite.events.onInputOut.add(this.displayInfo, this);
                    sprite.events.onInputUp.add(this.spriteClick, this);
                    sprite.input.enableDrag();
                    sprite.events.onDragStart.add(this.spriteDragStart, this);
                    sprite.events.onDragStop.add(this.spriteDragStop, this);
                    this.container.add(sprite);
                    col.push(sprite);
                }else{
                    col.push(null);
                }
            }
            this.itemSprites.push(col);
        }
        
        //"How filled the inventory is" text
        this.filledText = game.add.text(x+width/2, y+height-2, '', {align: 'center'});
        this.container.add(this.filledText);
        
        //Initialize infoText
        this.infoText = game.add.text(this.x, this.y-120, '', {fontSize: 16, wordWrap: true, wordWrapWidth: this.width,});
        this.container.add(this.infoText);
        
        //Initialize dropButton
        this.dropButton = game.add.sprite(this.x-35-64, this.y-120, 'drop-button');
        this.container.add(this.dropButton);
        this.dropButton.inputEnabled = true;
        this.dropButton.events.onInputUp.add(this.dropItem, this);
        this.dropButton.visible = false;
        //this.container.events.onInputOver.add(this.displayInfo, this);
    },
    
    refreshInventory: function(){
        var itemCount = 0;
        for(var i = 0; i < this.WIDTH; i++){
            for(var j = 0; j < this.HEIGHT; j++){
                var item = Player.Inventory.items[i*this.HEIGHT+j];
                if(item == null && this.itemSprites[i][j] != null){ //delete sprite
                    this.itemSprites[i][j].kill();
                    this.itemSprites[i][j] = null;
                }else if(item != null && this.itemSprites[i][j] == null){ //add sprite where empty
                    this.itemSprites[i][j] = game.add.sprite(this.x+this.SPRITE_WIDTH*i, this.y+this.SPRITE_HEIGHT*j, 'items', item.spriteIndex);
                    this.itemSprites[i][j].width = this.SPRITE_WIDTH;
                    this.itemSprites[i][j].height = this.SPRITE_HEIGHT;
                    this.itemSprites[i][j].inputEnabled = true;
                    this.itemSprites[i][j].events.onInputOver.add(this.displayInfo, this);
                    this.itemSprites[i][j].events.onInputOut.add(this.displayInfo, this);
                    this.itemSprites[i][j].events.onInputUp.add(this.spriteClick, this);
                    this.itemSprites[i][j].input.enableDrag();
                    this.itemSprites[i][j].events.onDragStart.add(this.spriteDragStart, this);
                    this.itemSprites[i][j].events.onDragStop.add(this.spriteDragStop, this); 
                    this.container.add(this.itemSprites[i][j]);
                }else if(item == null && this.itemSprites[i][j] == null){ //both are null; do nothing
                    
                }
                else{ //switch sprite
                    this.itemSprites[i][j].frame = item.spriteIndex;
                }
                
                if(item != null)
                    itemCount++;
            }
        }
        this.filledText.text = itemCount+'/'+this.WIDTH*this.HEIGHT;
    },
    
    displayInfo: function(){
        if(this.isItemSelected){
            return false;
        }
        
        var x = game.input.mousePointer.x - this.x;
        var y = game.input.mousePointer.y - this.y;
        x = Math.floor(x/this.SPRITE_WIDTH);
        y = Math.floor(y/this.SPRITE_HEIGHT);
        this.itemSelected = x*this.HEIGHT+y;
        var item = Player.Inventory.items[x*this.HEIGHT+y];
        if(item != null){
            this.infoText.text = item.name+':\n'+item.description;
            return true;
        }
        else{
            this.infoText.text = '';
            return false;
        }
    },
    
    spriteClick: function(){
        this.isItemSelected = false;
        if(!this.displayInfo())
            return;
        this.isItemSelected = true;
        if(Player.Inventory.items[this.itemSelected].category != 'key item')
            this.dropButton.visible = true;
        else
            this.dropButton.visible = false;
    },
    
    spriteDragStart: function(sprite, pointer){
        this.itemDragged = sprite;
        var x = pointer.x - this.x;
        var y = pointer.y - this.y;
        x = Math.floor(x/this.SPRITE_WIDTH);
        y = Math.floor(y/this.SPRITE_HEIGHT);
        this.itemDraggedLoc = {x: x, y: y};
    },
    
    spriteDragStop: function(sprite, pointer){
        //check where we landed;
        var x = pointer.x - this.x;
        var y = pointer.y - this.y;
        x = Math.floor(x/this.SPRITE_WIDTH);
        y = Math.floor(y/this.SPRITE_HEIGHT);
        
        //if out of bounds, put sprite back to original location
        console.log(x+" , "+y+" vs "+this.itemSprites.length+" , "+this.itemSprites[0].length);
        if(x < 0 || this.itemSprites.length <= x || y < 0 || this.itemSprites[0].length <= y){
            sprite.x = this.x+this.itemDraggedLoc.x*this.SPRITE_WIDTH;
            sprite.y = this.y+this.itemDraggedLoc.y*this.SPRITE_HEIGHT;
        }
        else{
            //if it's empty, place it there & update items array
            if(Player.Inventory.items[x*this.HEIGHT+y] == null){
                sprite.x = this.x+x*this.SPRITE_WIDTH;
                sprite.y = this.y+y*this.SPRITE_HEIGHT;
                Player.Inventory.items[x*this.HEIGHT+y] = Player.Inventory.items[this.itemDraggedLoc.x*this.HEIGHT+this.itemDraggedLoc.y];
                Player.Inventory.items[this.itemDraggedLoc.x*this.HEIGHT+this.itemDraggedLoc.y] = null;
                this.itemSprites[x][y] = sprite;
                this.itemSprites[this.itemDraggedLoc.x][this.itemDraggedLoc.y] = null;
            }
            else if(x == this.itemDraggedLoc.x && y == this.itemDraggedLoc.y){
                //Placed item on same spot it was dragged from
                sprite.x = this.x+x*this.SPRITE_WIDTH;
                sprite.y = this.y+y*this.SPRITE_HEIGHT;
            }
            else{
                //if full, then swap sprites & update items array
                sprite.x = this.x+x*this.SPRITE_WIDTH;
                sprite.y = this.y+y*this.SPRITE_HEIGHT;
                this.itemSprites[x][y].x = this.x+this.itemDraggedLoc.x*this.SPRITE_WIDTH;
                this.itemSprites[x][y].y = this.y+this.itemDraggedLoc.y*this.SPRITE_HEIGHT;
                
                var temp = Player.Inventory.items[x*this.HEIGHT+y];
                Player.Inventory.items[x*this.HEIGHT+y] = Player.Inventory.items[this.itemDraggedLoc.x*this.HEIGHT+this.itemDraggedLoc.y];
                Player.Inventory.items[this.itemDraggedLoc.x*this.HEIGHT+this.itemDraggedLoc.y] = temp;
                
                temp = this.itemSprites[x][y];
                this.itemSprites[x][y] = sprite;
                this.itemSprites[this.itemDraggedLoc.x][this.itemDraggedLoc.y] = temp;
            }
            
        }
        this.refreshInventory();
        
    },
    
    dropItem: function(){
        var item = Player.Inventory.items[this.itemSelected];
        if(item.category != 'key item'){
            Player.Inventory.items[this.itemSelected] = null;
            //Reset inventory & UI to deselect the deleted item
            this.refreshInventory();
            this.isItemSelected = false;
            this.displayInfo();
            this.dropButton.visible = false;
        }
    },
    
    
    
}