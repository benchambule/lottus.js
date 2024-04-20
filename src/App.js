'use strict';

/**
 * Starting point for the interaction with the Application. An application can have one or more bots
 * @param sessionManager {object} - The storage implementation which will be used. All bots of the app use the same sessionManager
 * @param help_prompts {Array} - when the user types one of these prompts, the help menu will be displayed. 
 * The help menu is a list of all bots available, with their descriptions
 */
class App {
    constructor(sessionManager, help_prompts = ['!help', '!ajuda'], debug = false){
        this.sessionManager = sessionManager;

        this.bots = {};
        this.keywords = {};
        this.help_prompts = help_prompts;
        this.debug = debug;
    }

    /**
     * Adds a bot to the application
     * @param bot {Bot} - the bot to be added to the application.
     */
    addBot(bot){
        bot.debug = this.debug;
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
     * @example {msisdn: '841234567', prompt: '1'}
     * @param {string} request.msisdn - the msisdn of the user
     * @param {string} request.prompt - the prompt of the user. Which can be a help prompt, a bot keyword or another message
     * @returns {Menu}
     */
    process(request){
        if(this.debug){
            console.log("Processing request:", request);
        }

        if(this.help_prompts.includes(request.prompt)) {
            var message = "Available bots";
            
            for(const [key, value] of Object.entries(this.bots)){
                var description = "";

                if(value.description){
                    description = value.description;
                }

                message += "\n" + value.keyword + " : " + description;
            }

            return {
                name: 'help_menu',
                title: 'Help',
                message: message,
                final: true
            }
        }

        const reqs = request.prompt.split(" ");
        var keyword = request.prompt;

        if(reqs.length > 1){
            keyword = reqs[0];
        }

        if(keyword in this.keywords){
            const session = this.sessionManager.get(request.msisdn);
            const bot = this.getBot(this.keywords[keyword]);

            if(session && !bot.inline){
                if(this.debug){
                    console.log("Closing session, bot is not inline");
                }
                this.sessionManager.close(session);
            }

            var result = null;
            if(bot){
                if(this.debug){
                    console.log("Processing request ", request, "with bot", bot.name);
                }
                result = bot.process(request);  
            }
            
            return result;
        }else{
            if(this.sessionManager){
                const session = this.sessionManager.get(request.msisdn);

                if(session){
                    const bot = this.getBot(session.bot);
                    var result = null;
                    if(bot){
                        if(this.debug){
                            console.log("Processing request ", request, "with bot", bot.name);
                        }
                        result = bot.process(request);  
                    }
                    
                    return result;
                }
            }
        }
    }
}

module.exports = App;