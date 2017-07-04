var Dialogs = {
    
    dialogActive: false,
    textbox: null,
    timer: null,
    text: null,
    
    init: function(){
        Dialogs.dialogNode = function(text){
            if(typeof text === "string"){
                this.text = text;
            }
            else{
                this.text = text.text;
                if(text.choices)
                    this.choices = text.choices;
                if(text.script)
                    this.script = text.script;
            }
            
            this.next = null;
            this.complete = false;
        }
        
        /*
            What can be passed as chainObject:
                String or Dialogs.dialog : Next line of text for dialog
                Obj(String text, Obj [] choices): branching dialog based on user choices
                    choice(String text, Obj next)
                Obj(function script): script to execute. Will end dialog before execution, and script can contain new dialog
        */
        Dialogs.dialogNode.prototype.chain = function(chainObject){
            this.next = new Dialogs.dialogNode(chainObject);
            return this.next;
        }
        
        Dialogs.dialogNode.prototype.execute = function(callback){
            //Initialize the dialog box if it hasn't been already
            Dialogs.beginDialog(this);
            
            //Draw initial text
            console.log(Dialogs);
            Dialogs.text.text = "";
            Dialogs.timer = game.time.events;
            Dialogs.timer.repeat(20, this.text.length+1, function(written){ //timer to write the text out
                if(written.text.length < this.text.length){written.text = written.text + this.text.charAt(written.text.length)}
                else{ //setup for continuing dialog
                    this.complete = true;
                    if(this.choices){ //branching dialog
                        console.log(this.choices);
                        
                        for(var i = 0; i < this.choices.length; i++){
                            var btn = $(document.createElement('button'));
                            btn.html(this.choices[i].text);
                            var nxt = this.choices[i].next;
                            console.log(nxt);
                            btn.click(function(next){
                                return function(){$('#dialogChoices').empty(); next.execute(callback);}
                            }(nxt));
                            $('#dialogChoices').append(btn);
                            $('#dialogChoices').append('<br/>');
                        }
                    }else if(this.next == null){ //end of dialog
                        var self = this; //self doesn't work in some places b/c endDialog belongs to the parent object Dialogs, not dialogNode! TODO fix it up
                        Dialogs.continue = function(){if(self.script) self.script(); this.endDialog(); callback.call(Scripts);}
                    }else{ //normal dialog
                        var self = this;
                        Dialogs.continue = function(){if(self.script) self.script(); self.next.execute(callback);}
                    }
                }
                
            }, this, Dialogs.text);
            Dialogs.timer.start();
        }
        
    },
    
    beginDialog: function(dialog){
        //Initialize Dialog
        if(!this.dialogActive){
            this.dialogActive = true;
            this.textbox = game.add.sprite(50+game.camera.x, game.camera.y+game.camera.height-250, 'textbox');
            this.text = game.add.text(100+game.camera.x, game.camera.y+game.camera.height-200, "", {wordWrap: true, wordWrapWidth: 1080});
            console.log('Beginning dialog: camera = (' + game.camera.x + ',' + game.camera.y + '), textbox: (' + (50+game.camera.x) + ',' + (350-game.camera.y)+')');
        }
    },
    
    endDialog: function(){
        this.text.destroy();
        this.textbox.destroy();
        this.dialogActive = false;
    },
    
    continue: null,
    update: function(){
        if(InputHandler.spacebar.clicked && this.continue){
            this.continue();
            this.continue = null;
        }
    }
    
}

Dialogs.init();