'use strict';

/**
 * Represents the menu options
 * @param {string} key - the key of the option
 * @param {string} label - the label of the option
 * @param {string} menu - the menu of the option
 */
class Option {
    constructor(key, label, menu = ''){
        this.key = key;
        this.label = label;
        this.menu = menu;
    }

    toSimpleOption(){
        return this.key + " - " + this.label;
    }
}

module.exports = Option;
