var menuPanelQuests = {
    container: null,
    activeQuests: [],
    completedQuests: [],
    
    selectedQuest: null,
    selectedQuestIndex: -1,
    questText: null,
    
    create: function(x, y, width, height){
        //Reset changing vars
        this.selectedQuest = null;
        this.selectedQuestIndex = -1;
        
        this.x = x; this.y = y; this.width = width; this.height = height;
        this.container = game.add.group();
        this.container.fixedToCamera = true;
        var itemY = 0;
        for(var i = 0; i < Player.Quests.active.length; i++){
            var item = game.add.text(this.x, this.y+itemY+4, Player.Quests.active.name, {fontSize: 16, wordWrap: true, wordWrapWidth: this.width});
            item.questReference = Player.Quests.active[i];
            item.inputEnabled = true;
            item.events.onInputUp.add(this.questSelected, this, 0, i);
            itemY = item.y+item.height;  
            this.activeQuests.push(item);
            this.container.add(item);
        }
        
        this.questText = game.add.text(this.x, this.y - 120, "Hello!", {fontSize: 16, wordWrap: true, wordWrapWidth: this.width});
        this.container.add(this.questText);
    },
    
    /*
        Refresh the list of quests and displayed stage for each.
        
    */
    refresh: function(){
        //Delete current quest texts, replace them
        for(var i = 0; i < this.activeQuests.length; i++){
            this.activeQuests[i].kill();
        }
        this.activeQuests = [];
        
        var itemY = 0;
        for(var i = 0; i < Player.Quests.active.length; i++){
            var item = game.add.text(this.x, this.y+itemY+4, "Quest: "+Player.Quests.active[i].name, {fontSize: 16, wordWrap: true, wordWrapWidth: this.width});
            item.questReference = Player.Quests.active[i];
            item.inputEnabled = true;
            var self = this;
            (function(val){item.events.onInputUp.add(self.questSelected, self, 0, val);})(i);
            
            itemY = item.y+item.height;
            this.activeQuests.push(item);
            this.container.add(item);
        }
        
        //Quest no longer exists, unhighlight
        if(this.selectedQuestIndex != -1 && this.selectedQuestIndex < this.activeQuests.length && 
           this.selectedQuest.name == this.activeQuests[this.selectedQuestIndex].name){
            this.questSelected(this.activeQuests[this.selectedQuestIndex]);
        }else{
            this.selectedQuest = null;
            this.selectedQuestIndex = -1;
            this.questText.text = '';
            return;
        }
            
    },
    
    questSelected: function(text){
        for(var i = 0; i < this.activeQuests.length; i++){
            this.activeQuests[i].fill = 'black';
            if(this.activeQuests[i] == text)
                this.selectedQuestIndex = i;
        }
        
        this.selectedQuest = text;
        text.fill = 'white';
        this.questText.text = text.questReference.steps[text.questReference.stage];
    },
}