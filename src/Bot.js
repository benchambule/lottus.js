'use strict';

const Menu = require('./Menu')
const inlineBotProcessor = require('./InlineBotProcessor')
const nonInlineBotProcessor = require('./NonInlineBotProcessor')

/**
 * Bot definition
 * @param {string} name - the name of the bot
 * @param {string} entrypoint - the entrypoint of the bot. This can be a menu name or a processor name.
 * @param {string} keyword - the keyword to start the bot.
 * @param {boolean} inline - whether the bot is inline or not. Inline bots do not require context and just display information.
 * @param {SessionManager} sessionManager - the session storage to be used. Not required if bot is inline.
 * @param {string} description - the description of the bot.
 * @param {string} exitword - a word that kills the bot. Not required if bot is inline.
 * @param {string} exitpoint - a menu name that represents the goodbye message. Not required if bot is inline.
 */

class Bot {
    #_processors = {};
    #_interceptors = {};

    constructor(data){
        if(data){
            this._initialize(data);
        }
    }

    _initialize(data){
        this.name = data.name;
        this.entrypoint = data.entrypoint;
        this.keyword = data.keyword;
        this.inline = data.inline;
        this.sessionManager = data.sessionManager;
        this.description = data.description;
        this.exitword = data.exitword;
        this.exitpoint = data.exitpoint;
        this.debug = data.debug?true:false;

        if(!this.inline) {
            this.invali_option_message = data.invali_option_message;

            if(!this.invali_option_message){
                this.invali_option_message = '❌ Invalid option. Please try again 🙃';
            }

            if(!data.exitpoint){
                this.exitpoint = 'exit';
            }

            if(!data.exitword){
                this.exitword = '@exit';
            }
        }

        if(!data.processor){
            if(this.inline){
                this.processor = inlineBotProcessor;
            }else{
                this.processor = nonInlineBotProcessor;
            }
        }
    }

    /**
     * Set's the session storage
     * @param {SessionManager} - the object that will be used to store the sessions.
     */
    setSessionManager(sessionManager){
        this.sessionManager = sessionManager;
    }

    /**
     * Adds a processor to the list of processors.
     * @param {string} name - the name of the processor. 
     * @param {function} processor - a function that returns a {Menu} object.
     * 
     * The function params can be:
     * @param {Request} request - the request object.
     * @param {Map<string, string>} tags - the tags object.
     * @returns {Menu} - the menu object. Or object with {tags: Map<string, string>, menu: Menu}.
     * @example
     * addProcessor('processor_name', (request) => {
     * console.log(request.prompt);
     *      return new Menu({name: 'hello', text:'hello world});
     * });
     * 
     * @example
     * Note that we can receive tags or return tags. Tags will be saved to the session for later access.
     * addProcessor('processor_name', (request, tags) => {
     *      return {tags: [{'key':'value'}], menu: new Menu({name: 'hello', text:'hello world})};
     * });
     */
    addLocationProcessor(name, processor){
        this.#_processors[name] = processor;
    }

    addLocationInterceptor(name, interceptor){
        this.#_interceptors[name] = interceptor;
    }


    /**
     * Update processor details
     * @param {string} name - name of the processor
     * @param {function} processor - a processor function
     */
    updateLocationProcessor(name, processor){
        this.#_processors[name] = processor;
    }

    /**
     * 
     * @param {string} menu 
     * @returns 
     */
    getLocationInterceptor(menu){
        var interceptor = this.#_interceptors[menu];

        if(!interceptor){
            interceptor = this.#_interceptors["*"];
        }

        return interceptor;
    }

    /**
     * Figures out the best strategy to process a request.
     * If the bot is inline, it will process the request without creating a session.
     * @param {object} request - the request details. The minimum request object has the following definition {msisdn: 'msisdn', prompt: 'prompt'}.
     * @returns {Menu} - the menu object, or null if no Menu was generated.
     */
    process(request){
        return this.processor(this, request);
    }

    /**
     * Returns a processor by name
     * @param {string} name - the processor name
     * @returns 
     */
    getLocationProcessor(name){
        if(this.#_processors){
            return this.#_processors[name];
        }else{
            return null
        }
    }
}

module.exports = Bot;