'use strict';
//TODO: Update documentation

async function __process_location(location, request, tags, context){
    const interceptor = context.bot.getInterceptor(location);
    let result = null;

    let p_context = {
        location: location,
        name: context.bot.name,
        keyword: context.bot.keyword,
        entrypoint: context.bot.entrypoint,
        menu: context.menu,
    }

    if(interceptor){
        if(context.bot.debug){
            console.log("Calling interceptor for location:", location, "with details", p_context);
        }

        result = await interceptor(request, tags, p_context);

        if(context.bot.debug){
            console.log("Result from calling interceptor for location:", location, "is", result);
        }

        if(result && result.request && !result.menu){
            if(context.bot.debug){
                console.log("Updating old request with new", result.request);
            }
            request = result.request;
            result = null;
        }
    }

    if(!result){
        const processor = context.bot.getProcessor(location);
        if(processor){
            if(context.bot.debug){
                console.log("Calling processor for location:", location, "with details", p_context);
            }
            
            result = await processor(request, tags, p_context);

            if(context.bot.debug){
                console.log("Result from interceptor for location:", location, "is", result);
            }
        }
    }

    return result;
}


/***
 * Processes a menu with options
 * @param request
 * @param tags
 * @param context
 * @returns {*}
 */
async function process_options(request, tags, context){
    if(context.bot.debug){
        console.log("Processing options request:", request, "with tags:", tags);
    }

    let result = null;

    // TODO: Unuse for, prefer other options
    for (const [, value] of Object.entries(context.menu.options)) {
        if(request.prompt.toString() === value.key.toString()){
            request.selected_option = value;

            if(request.selected_option.tags){
                tags = {...tags, ...request.selected_option.tags};
            }

            result = await __process_location(value.menu, request, tags, context);

            break;
        }
    }

    if(!result){
        // TODO: Add defined error message
        return {
            menu: context.menu,
            success: false
        };
    }

    // TODO: Check if the result is formatted correctly
    return {
        menu: result.menu,
        tags: {...tags, ...result.tags},
        redirect: result.redirect,
        success: true
    };
}

/***
 * Process a menu with required information
 * @param request
 * @param tags
 * @param context
 * @returns {*}
 */
async function process_required(request, tags, context){
    if(context.bot.debug){
        console.log("Processing required request:", request, "with tags:", tags);
    }
    let result = null;
    const current_menu = context.menu;

    const required = current_menu.required;
    let menu = null;

    if(required.in){
        let opts = required.in.options;
        let prompt = request.prompt.trim();
        if(required.in.ignore_case){
            prompt = request.prompt.trim().toUpperCase();
            opts = []
            for(let opt of required.in.options){
                opts.push(opt.toUpperCase());
            }
        }

        if(!(opts.includes(prompt))){
            menu = current_menu;
            menu['message'] = required.error_message;

            return {menu: menu, tags: tags, success: false}
        }
    }

    if(!required.regex.test(request.prompt)){
        menu = current_menu;
        menu['message'] = required.error_message;

        return {menu: menu, tags: tags, success: false};
    }

    tags[required.name] = request.prompt;

    result = await __process_location(current_menu.next, request, tags, context);

    if(!result){
        // TODO: Add predefined error message
        return {
            menu: context.menu,
            success: false
        };
    }

    return {
        menu: result.menu, 
        tags: {...tags, ...result.tags}, 
        redirect: result.redirect,
        success: true
    };
}


async function inner_processor(bot, request, session){
    if(bot.debug){
        console.log("Processing request:", request, "session:", session);
    }

    let result = null;
    const context = {bot: bot, menu: null};

    if (request.prompt && (request.prompt === bot.keyword || request.prompt.includes(bot.keyword))){
        if(!session.tags){
            session.tags = []
        }

        result = await __process_location(bot.entrypoint, request, session.tags, context);

        if(result && result.menu){
            session.menu = result.menu;
            session.tags = {...session.tags, ...result.tags};
        }
    } else {
        const current_menu = session.menu;
        context.menu = session.menu;

        const interceptor = bot.getInterceptor("*");
        if(interceptor){
            if(bot.debug){
                console.log("Invoking interceptor for: ", "*");
            }
            result = await interceptor(request, session.tags, context);

            if(result && result.request && !result.menu){
                if(bot.debug){
                    console.log("Updating old request with new", result.request);
                }
                request = result.request;
                result = null;
            }
        }

        if(current_menu.options && (!result || (result && result.menu && result.menu.name === current_menu.name))){
            if(bot.debug){
                console.log("Processing options for :", current_menu.name);
            }
            result = await process_options(request, session.tags, context);
        }

        if(current_menu.required && (!result || (result && result.menu && result.menu.name === current_menu.name))){
            if(bot.debug){
                console.log("Processing required for :", current_menu.name);
            }
            result = await process_required(request, session.tags, context);
        }

        if(!result || (result && result.success)){
            if(current_menu.next && (!result || (result && result.menu && result.menu.name === current_menu.name))){
                result = await __process_location(current_menu.next, request, session.tags, context);
            }
        }

        if(result){
            if(bot.debug){
                console.log("Result of the processing is: ", result);
            }

            if(result.redirect){
                if(result.redirect.tags){
                    result.tags = {...result.redirect.tags, ...result.tags};
                }

                if(result.redirect.prompt){
                    request.prompt = result.redirect.prompt;
                }

                result = await __process_location(result.redirect.menu, request, result.tags, context);
            }

            if(result.menu){
                session.location = result.menu.name;

                if(!result.menu.options && !result.menu.required && !result.menu.next){
                    result.menu.final = true;
                }
            }

            if(result.tags){
                for (const [key, value] of Object.entries(result.tags)) {
                    session.tags[key] = value;
                }
            }
        }
    }

    return {menu: result.menu, session: session, tags: session.tags};;
}

/**
 * Processes a request with a bot
 * @param {*} bot - the bot to process the request with
 * @param {*} request - the request to process
 * @returns {*}
 */
async function defaultProcessor(bot, request, session){
    if(bot.debug){
        console.log("Processing request: ", request, "with bot:", bot.name);
    }

    if(!session){
        session = {
            bot: bot.name,
            msisdn: request.msisdn,
            active: true,
            tags: []
        }
    }

    let result = await inner_processor(bot, request, session);

    if(!result || !result.menu){
        return;
    }

    if(!request.prompt){
        request.prompt = "";
    }

    if(result && result.menu && result.tags){
        for (const [key, value] of Object.entries(result.tags)) {
            if(result.menu.message && result.menu.message.includes("{{" + key + "}}")){
                result.menu.message = result.menu.message.replace("{{" + key + "}}", value);
            }
            if(result.menu.title && result.menu.title.includes("{{" + key + "}}")){
                result.menu.title = result.menu.title.replace("{{" + key + "}}", value);
            }
        }
    }

    session = result.session;

    session.menu = result.menu;
    session.tags = result.tags;
    session.active = !session.menu.final;

    if(bot.debug){
        console.log("Result from processing request:", request, 'is:', session);
    }

    return session;
}

/**
 * Bot definition
 * @param {string} name - the name of the bot
 * @param {string} entrypoint - the entrypoint of the bot. This can be a menu name or a processor name.
 * @param {string} keyword - the keyword to start the bot.
 * @param {string} description - the description of the bot.
 */

class Bot {

    constructor(data){
        if(data){
            this._initialize(data);
        }
    }

    _initialize(data){
        this.processors = {};
        this.interceptors = {};
        this.name = data.name;
        this.entrypoint = data.entrypoint;
        this.keyword = data.keyword;
        this.description = data.description;
        this.debug = data.debug?true:false;

        if(!data.processor){
            this.processor = defaultProcessor;
        }
    }

    getLocationProcessors(){
        return this.processors;
    }

    getLocationInterceptors(){
        return this.interceptors;
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
        this.processors[location] = processor;
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
        this.interceptors[location] = interceptor;
    }

    /**
     * Adds multiple menus to the bot.
     * @param {[Map<string, object>]} menus - the list of menus
     */
    addMenus(menus){
        for(let menu of menus){
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
        this.at(menu.name, async function(req, tags){
            if(menu.required && menu.required.regex){
                menu.required.regex = new RegExp(menu.required.regex);
            }
            
            return {
                menu: menu,
                tags: tags,
            }
        });
    }

    /**
     * 
     * @param {string} location 
     * @returns {function}
     */
    getInterceptor(location){
        let interceptor = this.interceptors[location];

        if(!interceptor){
            interceptor = this.interceptors["*"];
        }

        return interceptor;
    }

    /**
     * Figures out the best strategy to process a request.
     * @param {object} request - the request details. The minimum request object has the following definition {msisdn: 'msisdn', prompt: 'prompt'}.
     * @returns {Map<string, object} - the menu object, or null if no Menu was generated.
     */
    async process(request, session = null){
        return await this.processor(this, request, session);
    }

    /**
     * Returns a processor by location
     * @param {string} location - the processor location
     * @returns 
     */
    getProcessor(location){
        if(this.processors){
            return this.processors[location];
        }else{
            return null
        }
    }
}

function createBotFromJSON(json){

    const entrypoint = json['entrypoint'];
    const keyword = json['keyword'];
    const name = json['name'];
    const inline = json['inline'];
    const menus = json['menus'];
    const description = json['description'];

    const bot = new Bot(
        {
            name: name,
            entrypoint: entrypoint,
            keyword: keyword,
            inline: inline,
            description: description,
        }
    );

    bot.addMenus(menus);

    return bot;
}

module.exports = {
    Bot: Bot,
    createBotFromJSON: createBotFromJSON,

    version: require('./package.json'),
}
