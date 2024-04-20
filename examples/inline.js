const {Bot} = require('../index');

var reverse = new Bot(
    {
        name: "reverse", 
        entrypoint: 'main', 
        keyword: "@reverse", 
        inline: true, 
        description: "Reverses a provided string" 
    }
);

reverse.at('main', (request, context) => {
    const txt = request.lang == 'pt'? 'Frase invertida' : 'Reversed sentence';
    const prompt = request.prompt.replace(context.bot.keyword, "").trim();
    const menu = {
        title: txt,
        message: prompt.split("").reverse().join(""),
        final: true
    }

    return {
        menu: menu
    };
});

console.log(reverse.process({msisdn: 123, prompt:"@reverse hello world"}));
console.log(reverse.process({msisdn: 123, prompt:"@reverse ola mundo", lang:"pt"}));


reverse = new Bot(
    {
        name: "reverse", 
        entrypoint: 'main', 
        keyword: "@reverse", 
        inline: true, 
        description: "Reverses a provided string" 
    }
);

reverse.intercept('main', (request) => {
    if(request.lang != 'pt'  && request.lang != 'en'){
        const menu = {
            title: 'lang cannot be ' +  "'" + request.lang+ "'" + ". lang should be 'en' or 'pt'",
            final: true
        }
        return {
            menu: menu
        };
    }
});

reverse.at('main', function(request, context){
    const txt = request.lang == 'pt'? 'Frase invertida' : 'Reversed sentence';
    const prompt = request.prompt.replace(context.bot.keyword, "").trim();
    const menu = {
        title: txt,
        text: prompt.split("").reverse().join(""), 
        final: true
    }

    return {
        menu: menu
    };
});

console.log("---------------------------------------------------------------");
console.log({msisdn: 123, prompt:"@reverse giberish"}, reverse.process({msisdn: 123, prompt:"@reverse giberish"}));

console.log("---------------------------------------------------------------");
console.log({msisdn: 123, prompt:"@reverse bonjour le monde", lang:"fr"}, reverse.process({msisdn: 123, prompt:"@reverse bonjour le monde", lang:"fr"}));

console.log("---------------------------------------------------------------");
console.log({msisdn: 123, prompt:"@reverse ola mundo", lang:"pt"}, reverse.process({msisdn: 123, prompt:"@reverse ola mundo", lang:"pt"}));

console.log("---------------------------------------------------------------");
console.log({msisdn: 123, prompt:"@reverse hello world", lang:"en"}, reverse.process({msisdn: 123, prompt:"@reverse hello world", lang:"en"}));
