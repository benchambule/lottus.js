'use strict';

/**
 * Represents the required tag in a menu
 * @param {string} name - The name of the required tag
 * @param {string} regex - The regex to match the input 
 * @param {string} error - The error message to display if the input does not match the regex
 * @param {string} next_menu - The next menu to display if the input matches the regex
 */
class Required{
    constructor(data){
        this._initialize(data);
    }

    _initialize(data){
        this.name = data.name;
        this.regex = data.regex;
        this.error = data.error;
        this.next_menu = data.next_menu;
    }
}

module.exports = Required;
