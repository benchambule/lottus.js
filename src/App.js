'use strict';

const Menu = require("./Menu");


class App {
    constructor(sessionStorage, help_commands = ['!help', '!ajuda']){
        this.sessionStorage = sessionStorage;

        this.bots = {};
        this.keywords = {};
        this.help_commands = help_commands;
    }

    addBot(bot){
        this.bots[bot.name] = bot;
        this.keywords[bot.keyword] = bot.name;
    }

    getBot(name){
        return this.bots[name];
    }

    deleteBot(name){
        delete this.bots[name];
    }

    process(request){
        if(this.help_commands.includes(request.command)) {
            if(this.sessionStorage){
                const session = this.sessionStorage.getSession(request.msisdn);

                if(session){
                    this.sessionStorage.endSession(session);
                }
            }

            var text = "Available bots";
            
            for(const [key, value] of Object.entries(this.bots)){
                var description = "";

                if(value.description){
                    description = value.description;
                }

                text += "\n" + value.keyword + " : " + description;
            }

            return new Menu({
                name: 'help_menu',
                title: 'Help',
                text: text,
                final: true
            })
        }

        const reqs = request.command.split(" ");
        var keyword = request.command;

        if(reqs.length > 1){
            keyword = reqs[0];
        }

        if(keyword in this.keywords){
            const session = this.sessionStorage.getSession(request.msisdn);

            if(session){
                this.sessionStorage.endSession(session);
            }

            return this.getBot(this.keywords[keyword]).process(request);
        }else{
            if(this.sessionStorage){
                const session = this.sessionStorage.getSession(request.msisdn);

                if(session){
                    return this.getBot(session.bot).process(request);
                }
            }
        }
    }
}

module.exports = App;