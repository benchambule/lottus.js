function process_options(request, tags, context){
    if(context.bot.debug){
        console.log("Processing options request:", request, "with tags:", tags);
    }
    var result = null;

    for (const [, value] of Object.entries(context.current_menu.options)) {
        if(request.prompt.toString() === value.key.toString()){
            const interceptor = context.bot.getLocationInterceptor(value.menu);
            if(interceptor){
                if(context.bot.debug){
                    console.log("Invoking interceptor for :", value.menu);
                }
                result = interceptor(request, tags, context);
            }

            if(!result){
                const processor = context.bot.getLocationProcessor(value.menu);
                if(processor){
                    if(context.bot.debug){
                        console.log("Invoking processor for :", value.menu);
                    }
                    result = processor(request, tags, context);
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


function process_required(request, tags, context){
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

    const interceptor = context.bot.getLocationInterceptor(current_menu.next_menu);
    if(interceptor){
        if(context.bot.debug){
            console.log("Invoking interceptor for :", current_menu.next_menu);
        }
        result = interceptor(request, tags, context);
    }

    if(!result){
        const processor = context.bot.getLocationProcessor(current_menu.next_menu);
        if(processor){
            if(context.bot.debug){
                console.log("Invoking processor for :", current_menu.next_menu);
            }
            result = processor(request, tags, context);
        }
    }

    if(!result){
        current_menu.message = context.invali_option_message;
        return {
            menu: current_menu,
        };
    }

    return {menu: result.menu, tags: result.tags};
}


function inner_processor(bot, request){
    if(bot.debug){
        console.log("Processing request:", request);
    }
    var result = null;
    var menu = null;
    var session = null;

    if (request.prompt === bot.keyword){
        const interceptor = bot.getLocationInterceptor(bot.entrypoint);
        const context = {bot: bot};

        if(interceptor){
            if(bot.debug){
                console.log("Invoking interceptor for :", bot.entrypoint);
            }
            result = interceptor(request, null, context);
        }

        if(!result){
            const processor = bot.getLocationProcessor(bot.entrypoint);
            if(processor){
                if(bot.debug){
                    console.log("Invoking processor for :", bot.entrypoint);
                }
                result = processor(request, null, context);
            }
        }

        if(result && result.menu && !result.menu.final){
            menu = result.menu;

            session = bot.sessionManager.createNew(
                {
                    bot: bot.name,
                    msisdn: request.msisdn,
                    current_menu: result.menu,
                    location: result.menu.name,
                    tags: []
                }
            );
        }

        return {menu: menu, session: session};
    }

    session = bot.sessionManager.get(request.msisdn);
    if(!session){
        console.log("Session for msisdn", request.msisdn, 'not found!')
    }

    if(session){
        const current_menu = session.current_menu;
        const interceptor = bot.getLocationInterceptor(current_menu.name);

        const context = {bot: bot, current_menu: session.current_menu};

        if(interceptor){
            if(bot.debug){
                console.log("Invoking interceptor for :", current_menu.name);
            }
            result = interceptor(request, session.tags, context);
        }

        if(!result && current_menu.options){
            if(bot.debug){
                console.log("Processing options for :", current_menu.name);
            }
            result = process_options(request, session.tags, context);
        }

        if(current_menu.required && (!result || (result && result.menu && result.menu.name === current_menu.name))){
            if(bot.debug){
                console.log("Processing required for :", current_menu.name);
            }
            result = process_required(request, session.tags, context);
        }

        if(!result || (result && result.menu && result.menu.name === current_menu.name)){
            const interceptor = bot.getLocationInterceptor(current_menu.next_menu);
            if(interceptor){
                if(bot.debug){
                    console.log("Invoking interceptor for :", current_menu.next_menu);
                }
                result = interceptor(request, session.tags, context);
            }
        }

        if(!result){
            const processor = bot.getLocationProcessor(current_menu.next_menu);
            if(processor){
                if(bot.debug){
                    console.log("Invoking processor for :", current_menu.next_menu);
                }
                result = processor(request, session.tags, context);
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


function process(bot, request){
    if(bot.debug){
        console.log("Processing request: ", request, "with bot:", bot.name);
    }
    var result = inner_processor(bot, request);

    if(!result || !result.menu){
        return;
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