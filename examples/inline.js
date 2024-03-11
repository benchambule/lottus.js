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

reverse.addLocationProcessor('main', (request, context) => {
    txt = request.lang == 'pt'? 'Frase invertida' : 'Reversed sentence';
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


var reverse = new Bot(
    {
        name: "reverse", 
        entrypoint: 'main', 
        keyword: "@reverse", 
        inline: true, 
        description: "Reverses a provided string" 
    }
);

reverse.addLocationInterceptor('main', (request) => {
    if(request.lang != 'pt'  && request.lang != 'en'){
        const menu = {
            title: 'lang cannot be ' +  "'" + request.lang+ "'" + ". lang should be 'en' or 'pt'",
            final: true
        }
        return {
            menu: menu
        };
    };
});

reverse.addLocationProcessor('main', function(request, context){
    txt = request.lang == 'pt'? 'Frase invertida' : 'Reversed sentence';
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


console.log(reverse.process({msisdn: 123, prompt:"@reverse giberish"}));
console.log(reverse.process({msisdn: 123, prompt:"@reverse bonjour le monde", lang:"fr"}));
console.log(reverse.process({msisdn: 123, prompt:"@reverse ola mundo", lang:"pt"}));
console.log(reverse.process({msisdn: 123, prompt:"@reverse hello world", lang:"en"}));
