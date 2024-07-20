'use strict';
//TODO: Update documentation

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

    for (const [, value] of Object.entries(context.menu.options)) {
        if(request.prompt.toString() === value.key.toString()){
            request.selected_option = value;

            const interceptor = context.bot.getInterceptor(value.menu);
            if(interceptor){
                if(context.bot.debug){
                    console.log("Invoking interceptor for :", value.menu);
                }
                result = await interceptor(request, tags, context);

                if(result && result.request && !result.menu){
                    if(context.bot.debug){
                        console.log("Updating old request with new", result.request);
                    }
                    request = result.request;
                    result = null;
                }
            }

            if(!result){
                const processor = context.bot.getProcessor(value.menu);
                if(processor){
                    if(context.bot.debug){
                        console.log("Invoking processor for :", value.menu);
                    }
                    result = await processor(request, tags, context);
                }
            }

            break;
        }
    }

    if(!result){
        let current_menu = context.menu;
        current_menu.message = context.invali_option_message;

        return {
            menu: current_menu,
        };
    }

    return {menu: result.menu, tags: result.tags};
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

            return {menu: menu, tags: tags}
        }
    }

    if(!required.regex.test(request.prompt)){
        menu = current_menu;
        menu['message'] = required.error_message;

        return {menu: menu, tags: tags};
    }

    tags[required.name] = request.prompt;

    const interceptor = context.bot.getInterceptor(current_menu.next);
    if(interceptor){
        if(context.bot.debug){
            console.log("Invoking interceptor for :", current_menu.next);
        }
        result = await interceptor(request, tags, context);

        if(result && result.request && !result.menu){
            if(context.bot.debug){
                console.log("Updating old request with new", result.request);
            }
            request = result.request;
            result = null;
        }
    }

    if(!result){
        const processor = context.bot.getProcessor(current_menu.next);
        if(processor){
            if(context.bot.debug){
                console.log("Invoking processor for :", current_menu.next);
            }
            result = await processor(request, tags, context);
        }
    }

    if(!result){
        current_menu.message = context.invali_option_message;
        return {
            menu: current_menu,
        };
    }

    return {menu: result.menu, tags: {...tags, ...result.tags}};
}


async function inner_processor(bot, request, session){
    if(bot.debug){
        console.log("Processing request:", request);
    }
    let result = null;
    let menu = null;

    if (request.prompt && (request.prompt === bot.keyword || request.prompt.includes(bot.keyword))){
        const interceptor = bot.getInterceptor(bot.entrypoint);
        const context = {bot: bot};

        let tags = null;
        if(session && session.tags){
            tags = session.tags;
        }

        if(interceptor){
            if(bot.debug){
                console.log("Invoking interceptor for :", bot.entrypoint);
            }
            result = await interceptor(request, tags, context);

            if(result && result.request && !result.menu){
                if(bot.debug){
                    console.log("Updating old request with new", result.request);
                }
                request = result.request;
                result = null;
            }
        }

        if(!result){
            const processor = bot.getProcessor(bot.entrypoint);
            if(processor){
                if(bot.debug){
                    console.log("Invoking processor for :", bot.entrypoint);
                }
                result = await processor(request, tags, context);
                if(bot.debug){
                    console.log("Result :", result);
                }
            }
        }

        if(result && result.menu && !result.menu.final){
            if(bot.debug){
                console.log("Initializing session");
            }
            
            session = {
                bot: bot.name,
                msisdn: request.msisdn,
                current_menu: result.menu,
                location: result.menu.name,
                tags: result.tags? result.tags : [],
                active: true
            };
        }

        if(result && result.menu){
            menu = result.menu;
        }
        
        return {menu: menu, session: session};
    }

    if(!session){
        console.log("Session for msisdn", request.msisdn, 'not found!')
    }

    if(session){
        const current_menu = session.menu;
        const context = {bot: bot, menu: current_menu};

        const interceptor = bot.getInterceptor("*");
        if(interceptor){
            if(bot.debug){
                console.log("Invoking interceptor for :", "*");
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

        if(current_menu.next && (!result || (result && result.menu && result.menu.name === current_menu.name))){
            const interceptor = bot.getInterceptor(current_menu.next);

            if(interceptor){
                if(bot.debug){
                    console.log("Invoking interceptor for :", current_menu.next);
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

            if(!result){
                const processor = bot.getProcessor(current_menu.next);

                if(processor){
                    if(bot.debug){
                        console.log("Invoking processor for :", current_menu.next);
                    }
                    result = await processor(request, session.tags, context);
                }
            }
        }

        if(result){
            if(result.menu){
                menu = result.menu;
                session.location = result.menu.name;

                if(!result.menu.options && !result.menu.required && !result.menu.next){
                    result.menu.final = true;
                }
            }

            if(result.tags){
                
                for (const [key, value] of Object.entries(result.tags)) {
                    session.tags[key] = value;

                    if(menu.message){
                        menu['message'] = menu.message.replace("{{" + key + "}}", value);
                    }
                    if(menu.title){
                        menu['title'] = menu.title.replace("{{" + key + "}}", value);
                    }
                }
            }
        }

        return {menu: menu, session: session};
    }

    return null;
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
    let result = await inner_processor(bot, request, session);

    if(!result || !result.menu){
        return;
    }

    if(!request.prompt){
        request.prompt = "";
    }

    if(result && result.menu){
        const reqs = request.prompt.split(" ");
        let txt = reqs.join(" ");
        if(result.menu.message && result.menu.message.includes("{{$@}}")){
            result.menu.message = result.menu.message.replace("{{$@}}", txt);
        }

        if(result.menu.title && result.menu.title.includes("{{$@}}")){
            result.menu.title = result.menu.title.replace("{{$@}}", txt);
        }
        
        if(result.tags){
            for (const [key, value] of Object.entries(result.tags)) {
                if(result.menu.message && result.menu.message.includes("{{" + key + "}}")){
                    result.menu.message = result.menu.message.replace("{{" + key + "}}", value);
                }
                if(result.menu.title && result.menu.title.includes("{{" + key + "}}")){
                    result.menu.title = result.menu.title.replace("{{" + key + "}}", value);
                }
            }
        }

        if(result.session && result.session.tags){
            for (const [key, value] of Object.entries(result.session.tags)) {
                if(result.menu.message && result.menu.message.includes("{{" + key + "}}")){
                    result.menu.message = result.menu.message.replace("{{" + key + "}}", value);
                }
                if(result.menu.title && result.menu.title.includes("{{" + key + "}}")){
                    result.menu.title = result.menu.title.replace("{{" + key + "}}", value);
                }
            }
        }
    }

    if(result.session){
        result.session.menu = result.menu;
        result.session.active = !result.menu.final;
    }

    if(bot.debug){
        console.log("Result from processing request:", request, 'is menu:', result.menu.name);
    }

    return result.session;
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

    menus.forEach(menu => {
        bot.at(menu.name, async function(req, tags){
            if(menu.required && menu.required.regex){
                menu.required.regex = new RegExp(menu.required.regex);
            }
            
            return {
                menu: menu,
                tags: tags,
            }
        });
    });

    return bot;
}

module.exports = {
    Bot: Bot,
    createBotFromJSON: createBotFromJSON,

    version: require('./package.json'),
}