var questState = {
    
    items: null,
    categories: null,
    category: 0,
    indeces: [],
    cl: 0,
    
    itemWidth: 150,
    itemHeight: 35,
    itemBoundUp: 12,
    itemBoundDown: 4,
    
    itemBack: null,
    flavorText: null,
    highlight: null,
    
    maxScroll: 100,
    scrollTime: 0,
    lastTween: null,
    currentTween: null,
    itemsTween: null,
    
    preload: function(){
        
    },
    
    create: function(){
        //TEMP
        /*
        for(var i = 0; i < 10; i++){
            Player.Inventory.gear.push({name:'Item '+i, desc:'Generic Description #'+i});
            Player.Inventory.tools.push({name:'Tool '+i, desc:'Generic tool Description #'+i});
            Player.Inventory.resources.push({name:'Resource '+i, desc:'Generic resource Description #'+i});
            Player.Inventory.keyItems.push({name:'Quest Item '+i, desc:'Generic Item Description #'+i});
        }
        */
        
        //fill indeces list
        this.indeces = [0, 0];
        
        //Background Texture
        game.add.sprite(0, 0, 'info-back');
        
        this.items = game.add.group();
        this.createItems();
        
        
        //Categories
        var catBack = game.add.sprite(0, 0, 'item-back');
        catBack.scale.setTo(8.0/5.0, 2);
        this.categories = game.add.group();
        this.categories.x = 200;
        this.cl = 400;
        //Categories
        var text = game.add.text(0, 0, 'Active');
        text.setTextBounds(0, 0, 200, 100);
        text.setStyle({boundsAlignH:'center', boundsAlignV:'middle'});
        this.categories.add(text);
        
        text = game.add.text(0, 0, 'Completed');
        text.setTextBounds(200, 0, 200, 100);
        text.setStyle({boundsAlignH:'center', boundsAlignV:'middle'});
        this.categories.add(text);
        
        
        //Highlight quest title
        this.highlight = game.add.sprite(200, 25, 'highlight');
        
        //Description 'Texture'
        this.itemBack = game.add.sprite(300, 100, 'item-back');
        this.itemBack.scale.setTo(1, 10);
        this.flavorText = game.add.text(350, 150, '');
        
    },
    
    createItems: function(){
        //Clear out items inside this.items
        if(this.items != null){
            while(this.items.children.length != 0){
                this.items.children[0].destroy();
            }
        }
        
        //if(Player.Quests[Player.Quests.categories[this.category]])
        
        this.items.x = 50;
        this.items.y = 150+this.itemHeight*(2 - this.getIndex());
        for(var i = 0; i < Player.Quests[Player.Quests.categories[this.category]].length; i++){
            var item = Player.Quests[Player.Quests.categories[this.category]][i];
            var subGroup = game.add.group();
            subGroup.y = i*this.itemHeight;
            this.items.add(subGroup);
            var back = subGroup.create(0, 0, 'item-back');
            back.scale.setTo(0.4, 0.5);
            var text = game.add.text(25, 0, item.name, {fontSize: 18});
            if(i == this.getIndex())
                subGroup.x = -25;
            subGroup.add(text);
            if(i > this.getIndex() + this.itemBoundUp || i < this.getIndex() - this.itemBoundDown){
                subGroup.setAll('visible', false);
            }
        }
    },
    
    createFlavorText: function(){
        this.flavorText.text = Player.Quests[Player.Quests.categories[this.category]].desc;
    },
    
    update: function(){
        InputHandler.update();
        
        this.updateScroll();
        this.updateSwitch();
        
        if(InputHandler.pause.clicked){
            game.state.start('world');
        }
    },
    
    updateScroll: function(){
        if(InputHandler.up.clicked || (InputHandler.up.pressed && !InputHandler.up.tapped && scrollTime > this.maxScroll)){
            if(this.getIndex() > 0){
                this.completeTweens();
                this.indeces[this.category]--;
                this.flavorText.text = Player.Quests[Player.Quests.categories[this.category]][this.getIndex()].desc;
                
                //Tweens
                this.itemsTween = game.add.tween(this.items);
                this.itemsTween.to({y: this.items.y+this.itemHeight}, this.maxScroll, null, true);
                
                this.lastTween = game.add.tween(this.items.children[this.getIndex()+1]);
                this.lastTween.to({x: 0}, this.maxScroll, null, true);
                
                this.currentTween = game.add.tween(this.items.children[this.getIndex()]);
                this.currentTween.to({x: -25}, this.maxScroll, null, true);
                
                //Visiblity
                if(this.getIndex()+this.itemBoundUp+1 < this.items.children.length)
                    this.items.children[this.getIndex()+this.itemBoundUp+1].setAll('visible', false);
                if(this.getIndex()-this.itemBoundDown >= 0)
                    this.items.children[this.getIndex()-this.itemBoundDown].setAll('visible', true);
            }
            scrollTime = 0;
        }else if(InputHandler.down.clicked || (InputHandler.down.pressed && !InputHandler.down.tapped && scrollTime > this.maxScroll)){
            if(this.getIndex() < this.items.children.length-1){
                this.completeTweens();
                this.indeces[this.category]++;
                this.flavorText.text = Player.Quests[Player.Quests.categories[this.category]][this.getIndex()].desc;
                
                //Tweens
                this.itemsTween = game.add.tween(this.items);
                this.itemsTween.to({y: this.items.y-this.itemHeight}, this.maxScroll, null, true);
                
                this.lastTween = game.add.tween(this.items.children[this.getIndex()-1]);
                this.lastTween.to({x: 0}, this.maxScroll, null, true);
                
                this.currentTween = game.add.tween(this.items.children[this.getIndex()]);
                this.currentTween.to({x: -25}, this.maxScroll, null, true);
                
                //Visibility
                if(this.getIndex()+this.itemBoundUp < this.items.children.length)
                    this.items.children[this.getIndex()+this.itemBoundUp].setAll('visible', true);
                if(this.getIndex()-this.itemBoundDown-1 >= 0)
                    this.items.children[this.getIndex()-this.itemBoundDown-1].setAll('visible', false);
            }
            scrollTime = 0;
        }
        
        if(InputHandler.up.pressed || InputHandler.down.pressed){
            scrollTime += game.time.elapsed;
        }
    },
    
    updateSwitch: function(){
        if(InputHandler.left.clicked){
            if(this.category > 0){
                this.category--;
                this.categories.x += 200;
                this.createItems();
                
            }
        }else if(InputHandler.right.clicked){
            if(this.category < Player.Quests.categories.length-1){
                this.category++;
                this.categories.x -= 200;
                this.createItems();
            }
        }
    },
    
    /*Removes tweens and sets positions of items to what they should be post-tween*/
    completeTweens: function(){
        if(this.itemsTween != null)
            this.itemsTween.stop();
        if(this.lastTween != null)
            this.lastTween.stop();
        if(this.currentTween != null)
            this.currentTween.stop();
        
        this.items.y = 150 - (this.getIndex()-2)*this.itemHeight;
        this.items.children[this.getIndex()].x = -25;
        if(this.getIndex() > 0)
            this.items.children[this.getIndex()-1].x = 0;
        if(this.getIndex() < this.items.children.length-1)
            this.items.children[this.getIndex()+1].x = 0;
    },
    
    getIndex: function(){
        return this.indeces[this.category];
    },
    
    
    /*Selecting an item from a different window*/
    selectItem(){
        
    },
}