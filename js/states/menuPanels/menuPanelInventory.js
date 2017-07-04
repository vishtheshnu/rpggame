var menuPanelInventory = {
    
    container: null,
    itemSprites: [],
    
    create: function(x, y, width, height){
        this.container = game.add.group();
        this.container.fixedToCamera = true;
        this.x = x; this.y = y; this.width = width; this.height = height;
        
        //Fill itemSprites with contents of inventory
        for(var i = 0; i < 4; i++){
            var col = [];
            for(var j = 0; j < 9; j++){
                var item = Player.Inventory.items[i*9+j];
                if(item != null){
                    var sprite = game.sprite.add(x+64*i, y+64*j, 'items', item.spriteIndex);
                    sprite.inputEnabled = true;
                    this.container.add(sprite);
                    col.push(sprite);
                }else{
                    col.push(null);
                }
            }
            this.itemSprites.push(col);
        }
        
        console.log('Inventory Array: ');
        console.log(this.itemSprites);
    },
    
    refreshInventory: function(){
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 9; j++){
                var item = Player.Inventory.items[i*9+j];
                if(item == null && this.itemSprites[i][j] != null){ //delete sprite
                    this.itemSprites[i][j].kill();
                    this.itemSprites[i][j] = null;
                }else if(item != null && this.itemSprites[i][j] == null){ //add sprite where empty
                    this.itemSprites[i][j] = game.add.sprite(this.x+64*i, this.y+64*j, 'items', item.spriteIndex);
                    this.container.add(this.itemSprites[i][j]);
                }else if(item == null && this.itemSprites[i][j] == null){ //both are null; do nothing
                    
                }
                else{ //switch sprite
                    this.itemSprites[i][j].frame = item.spriteIndex;
                }
            }
        }
    },
    
}