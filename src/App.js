'use strict';

const Menu = require("./Menu");

/**
 * Starting point for the interaction with the Application. An application can have one or more bots
 * @param sessionManager {SessionManager} - The storage implementation which will be used.
 * @param help_commands {Array} - when the user types one of these commands, the help menu will be displayed. 
 * The help menu is a list of all bots available, with their descriptions
 */
class App {
    constructor(sessionManager, help_commands = ['!help', '!ajuda']){
        this.sessionManager = sessionManager;

        this.bots = {};
        this.keywords = {};
        this.help_commands = help_commands;
    }

    /**
     * Adds a bot to the application
     * @param bot {Bot} - the bot to be added to the application.
     */
    addBot(bot){
        this.bots[bot.name] = bot;
        this.keywords[bot.keyword] = bot.name;
    }

    /**
     * Returns a bot by name
     * @param {string} name 
     * @returns {Bot}
     */
    getBot(name){
        return this.bots[name];
    }

    /**
     * Deletes a bot by name
     * @param {string} name - the name of the bot to be deleted.
     */
    deleteBot(name){
        delete this.bots[name];
    }

    /**
     * 
     * @param {Map<string, string>} request 
     * @example {msisdn: '841234567', command: '1'}
     * @param {string} request.msisdn - the msisdn of the user
     * @param {string} request.command - the command of the user. Which can be a help command, a bot keyword or another text
     * @returns {Menu}
     */
    process(request){
        if(this.help_commands.includes(request.command)) {
            if(this.sessionManager){
                const session = this.sessionManager.getSession(request.msisdn);

                if(session){
                    this.sessionManager.endSession(session);
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
            const session = this.sessionManager.getSession(request.msisdn);

            if(session){
                this.sessionManager.endSession(session);
            }

            return this.getBot(this.keywords[keyword]).process(request);
        }else{
            if(this.sessionManager){
                const session = this.sessionManager.getSession(request.msisdn);

                if(session){
                    return this.getBot(session.bot).process(request);
                }
            }
        }
    }
}

module.exports = App;