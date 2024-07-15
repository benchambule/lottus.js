'use strict';

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
 */

class Bot {
    #_processors = {};
    #_interceptors = {};
    #_appContext;

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
        this.debug = data.debug?true:false;

        if(!this.inline) {
            this.invali_option_message = data.invali_option_message;

            if(!this.invali_option_message){
                this.invali_option_message = '❌ Invalid option. Please try again 🙃';
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

    getLocationProcessors(){
        return this.#_processors;
    }

    getLocationInterceptors(){
        return this.#_interceptors;
    }

    setAppContext(appContext){
        this.#_appContext = appContext;
    }

    getAppContext(){
        return this.#_appContext;
    }

    /**
     * Adds a processor to the list of processors.
     * @param {string} location - the location at which this processor is triggered. 
     * @param {function} processor - a function that returns a Map with menu map and tags map object.
     * 
     * The function params can be:
     * @param {Map<string, string>} request - the request object.
     * @param {Map<string, string>} tags - the tags object.
     * @param {Map<string, string>} context - the bot context.
     * @returns {Map<string, object>}
     * @example
     * at('location', (request) => {
     *      console.log(request.prompt);
     *      return {
     *          menu: {
     *              name: 'hello',  
     *              message: 'hello world'
     *          }
     *      }
     * });
     * 
     * @example
     * Note that we can receive tags or return tags. Tags will be saved to the session for later access.
     * at('location', (request, tags) => {
     *      console.log(request.prompt);
     *      console.log(tags);
     *      return {
     *          tags: {'key':'value'}, 
     *          menu: {name: 'hello', message:'hello world}
     *      };
     * });
     * @example
     * Note that we can receive tags or return tags. Tags will be saved to the session for later access.
     * at('location', (request, tags, ctxt) => {
     *      console.log(request.prompt);
     *      console.log(tags);
     *      console.log(ctxt.bot.keyword);
     *      return {
     *          tags: {'key':'value'}, 
     *          menu: {name: 'hello', message:'hello world}
     *      };
     * });
     */
    at(location, processor){
        this.#_processors[location] = processor;
    }

    /***
     * Intercepts a location. An interceptor has the following parameters
     * @param {string} location - the location at which this processor is triggered. 
     * @param {function} interceptor - a function that returns a menu map, tags map or request map object.
     * 
     * The function params can be:
     * @param {Map<string, string>} request - the request object.
     * @param {Map<string, string>} tags - the tags object.
     * @param {Map<string, string>} context - the bot context.
     * 
     * @returns {Map<string, object>} - the menu map, tags map or request map object.
     * 
     * @example
     * 
     * bot.intercept('divider', function(req){
     *      const reqs = req.prompt.trim().split(" ");
     *      if(reqs.length < 3){
     *           return {
     *               menu: {
     *                   message: "Please provide the dividend and the divisor"
     *               }
     *           }
     *       }
     *
     *      if(parseInt(reqs[2]) === 0){
     *          return {
     *              menu: {
     *                  message: "Division by zero is not allowed"
     *              }
     *          }
     *      }
     *  });
     */
    intercept(location, interceptor){
        this.#_interceptors[location] = interceptor;
    }

    /**
     * Adds multiple menus to the bot.
     * @param {[Map<string, object>]} menus - the list of menus
     */
    addMenus(menus){
        for(var menu of menus){
            this.addMenu(menu);
        }
    }

    /***
     * Add a menu to the bot.
     * @param {Map<string, object} menu - the menu object.
     * 
     * @example
     * {
     *     name: 'hello',
     *     message: 'hello world',
     *     final: false,
     *     options: [
     *          {key: 0, label: "Back", menu: 'main'},
     *     ]
     * }
     * 
     * @example
     * {
     *      name: 'name',
     *      title: "Welcome to the bot",
     *      message: "Please provide your name",
     *      required: {
     *          name: "name",
     *          error: "Invalid name",
     *          regex: /^.*$/,
     *      },
     *      next: "birthday",
     * }
     */
    addMenu(menu){
        this.at(menu.name, () => {
            return {
                menu: menu
            }
        });
    }

    /**
     * 
     * @param {string} location 
     * @returns {function}
     */
    getInterceptor(location){
        var interceptor = this.#_interceptors[location];

        if(!interceptor){
            interceptor = this.#_interceptors["*"];
        }

        return interceptor;
    }

    /**
     * Figures out the best strategy to process a request.
     * If the bot is inline, it will process the request without creating a session.
     * @param {object} request - the request details. The minimum request object has the following definition {msisdn: 'msisdn', prompt: 'prompt'}.
     * @returns {Map<string, object} - the menu object, or null if no Menu was generated.
     */
    async process(request){
        return this.processor(this, request);
    }

    /**
     * Returns a processor by location
     * @param {string} location - the processor location
     * @returns 
     */
    getProcessor(location){
        if(this.#_processors){
            return this.#_processors[location];
        }else{
            return null
        }
    }
}

module.exports = Bot;