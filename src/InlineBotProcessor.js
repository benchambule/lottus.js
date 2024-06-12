/***
 * Processes a request and returns a menu object
 * @param {Bot} bot- the bot object
 * @param {Map<string, string} request- the request object
 * @returns {Map<string, object} - the menu object
 */
function process(bot, request) {
    if(bot.debug){
        console.log("Processing request: " + request);
    }

    if(request.prompt.includes(bot.keyword)){
        const interceptor = bot.getInterceptor(bot.entrypoint);
        var result = null;
        if(interceptor){
            if(bot.debug){
                console.log("Invoking interceptor for :", bot.entrypoint);
            }
            result = interceptor(request);
        }
        
        if(!result || !result.menu){
            const processor = bot.getProcessor(bot.entrypoint);
            const context = {bot: bot};

            if(processor){
                if(bot.debug){
                    console.log("Invoking processor for:", bot.entrypoint);
                }
                result = processor(request, context);
            }else{
                //TODO: Indicate that bot has no entrypoint defined
            }
        }

        if(result && result.menu){
            const reqs = request.prompt.split(" ");
            const txt = reqs.join(" ");
    
            if(result.menu.message && result.menu.message.includes("{{$@}}")){
                result.menu.message = result.menu.message.replace("{{$@}}", txt);
            }
    
            if(result.menu.title && result.menu.title.includes("{{$@}}")){
                result.menu.title = result.menu.title.replace("{{$@}}", txt);
            }
    
            for(var i = 0; i < reqs.length; i++){
                if(result.menu.message && result.menu.message.includes("{{"+i+"}}")){
                    result.menu.message = result.menu.message.replace("{{"+i+"}}", reqs[i]);
                }
                if(result.menu.title && result.menu.title.includes("{{"+i+"}}")){
                    result.menu.title = result.menu.title.replace("{{"+i+"}}", reqs[i]);
                }
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
    
            result.menu.final = true;
            let session = {
                bot: bot.name,
                msisdn: request.msisdn,
                location: result.menu.name,
                active: false,
                menu: result.menu
            }
            console.log(session);

            return session;
        }
    }

    return null;
}

module.exports = process;
