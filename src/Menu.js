'use strict';
const Required = require('./Required');

/**
 * Represents a menu.
 * @param {string} name - the name fo the menu
 * @param {string} title - the title of the menu
 * @param {string} text - the text of the menu
 * @param {object} media - the media of the menu
 * @param {boolean} final - the final of the menu. If menu is final the session will be closed.
 * @param {object} options  - the options of the menu.
 * @param {object} required - the required of the menu. If menu is required the session will be closed.
 */
class Menu {
    constructor(data){
       if(data){
            this._initialize(data);
       } 
    }

    /**
     * Initialize menu with data details.
     * @param {object} data 
     */
    _initialize(data){
        this.name = data.name;
        this.title = data.title;
        this.text = data.text;
        this.media = data.media;
        this.final = data.final;
        this.options = data.options;

        this.required = data.required;
    }

    /**
     * Returns simple menu object
     * @returns object
     */
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