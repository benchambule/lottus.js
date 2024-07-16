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
    var result = null;

    for (const [, value] of Object.entries(context.current_menu.options)) {
        if(request.prompt.toString() === value.key.toString()){
            request.selected_option = value;
            
            if(value.tags){
                tags = Object.assign({}, tags, value.tags);
            }

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
        var current_menu = context.current_menu;
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
    var result = null;
    const current_menu = context.current_menu;

    const required = current_menu.required;
    var menu = null;

    if(required.in){
        var opts = required.in.options;
        var prompt = request.prompt.trim();
        if(required.in.ignore_case){
            prompt = request.prompt.trim().toUpperCase();
            opts = []
            for(var opt of required.in.options){
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


async function inner_processor(bot, request){
    if(bot.debug){
        console.log("Processing request:", request);
    }
    var result = null;
    var menu = null;
    var session = null;

    if (request.prompt && (request.prompt === bot.keyword || request.prompt.includes(bot.keyword))){
        const interceptor = bot.getInterceptor(bot.entrypoint);
        const context = {bot: bot};

        if(interceptor){
            if(bot.debug){
                console.log("Invoking interceptor for :", bot.entrypoint);
            }
            result = await interceptor(request, null, context);

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
                result = await processor(request, null, context);
            }
        }

        if(result && result.menu && !result.menu.final){
            session = bot.sessionManager.createNew(
                {
                    bot: bot.name,
                    msisdn: request.msisdn,
                    current_menu: result.menu,
                    location: result.menu.name,
                    tags: result.tags? result.tags : []
                }
            );
        }

        if(result && result.menu){
            menu = result.menu;
        }
        
        return {menu: menu, session: session};
    }

    session = bot.sessionManager.get(request.msisdn);
    if(!session){
        console.log("Session for msisdn", request.msisdn, 'not found!')
    }

    if(session){
        const current_menu = session.current_menu;
        const context = {bot: bot, current_menu: session.current_menu};

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
async function process(bot, request){
    if(bot.debug){
        console.log("Processing request: ", request, "with bot:", bot.name);
    }
    var result = await inner_processor(bot, request);

    if(!result || !result.menu){
        return;
    }

    // if(!request.prompt){
    //     return 
    // }
    if(!request.prompt){
        request.prompt = "";
    }

    if(result && result.menu){
        const reqs = request.prompt.split(" ");
        var txt = reqs.join(" ");
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
        result.session.current_menu = result.menu;
        bot.sessionManager.update(result.session);
    }

    if(bot.debug){
        console.log("Result from processing request:", request, 'is menu:', result.menu.name);
    }
    return result.menu
}

module.exports = process;