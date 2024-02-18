'use strict';

class Menu {
    constructor(data){
       if(data){
            this._initialize(data);
       } 
    }

    _initialize(data){
        this.name = data.name;
        this.title = data.title;
        this.text = data.text;
        this.media = data.media;
        this.final = data.final;
        this.options = data.options;
    }

    toSimpleMessage(){
        var text = this.title + '\n' + this.text;

        if(this.options){
            this.options.forEach(option => {
                text += "\n" + option.toSimpleOption();
            })
        }

        return {
            'text': text,
            'media': this.media
        };
    }
}

module.exports = Menu;