class Session {
    constructor(msisdn, location, current_menu, bot)
    {
        this.msisdn = msisdn;
        this.location = location;
        this.current_menu = current_menu;
        this.bot = bot;
        
        this.tags = [];
        
    }
}

module.exports = Session;
