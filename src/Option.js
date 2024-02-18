'use strict';

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
