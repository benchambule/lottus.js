'use strict';

class Session{
    constructor(id, msisdn, location, current_menu, bot){
        this.id = id;
        this.msisdn = msisdn;
        this.location = location;
        this.active = true;
        this.current_menu= current_menu;
        this.tags = [];
        this.bot = bot;
    }
}

module.exports = Session;