function process(bot, request) {
    if(bot.debug){
        console.log("Processing request: " + request);
    }

    if(request.prompt.includes(bot.keyword)){
        const interceptor = bot.getLocationInterceptor(bot.entrypoint);
        var result = null;
        if(interceptor){
            if(bot.debug){
                console.log("Invoking interceptor for :", bot.entrypoint);
            }
            result = interceptor(request);
        }
        
        if(!result || !result.menu){
            const processor = bot.getLocationProcessor(bot.entrypoint);
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
    
            if(result.menu.message && result.menu.message.includes("{{$@}}")){
                var txt = reqs.join(" ");
                result.menu.message = result.menu.message.replace("{{$@}}", txt);
            }
    
            if(result.menu.title && result.menu.title.includes("{{$@}}")){
                var txt = reqs.join(" ");
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
            return result.menu;
        }
    }

    return null;
}

module.exports = process;
