'use strict';

class Session{
    constructor(data){
        this._initialize(data);
    }

    _initialize(data){
        this.key = data.key;
        this.msisdn = data.msisdn;
        this.location = data.location;
        this.current_menu = data.current_menu;
        this.tags = data.tags;
        this.bot = data.bot;

        if(!this.tags){
            this.tags = [];
        }
    }
}

module.exports = Session;