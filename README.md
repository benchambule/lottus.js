# lottus.js
=====================

### Examples
---------------------
``` {.sourceCode .javascript}
'use strict';

const {Bot} = require('lottus.js');

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
```

``` {.sourceCode .javascript}
'use strict';

const {Bot, InMemorySessionManager} = require('lottus.js');

const menus = [
    {
        name: "welcome",
        title: "Welcome",
        message: "Language | Idioma",
        options: [
            {key:1, label:"English", menu:"english"},
            {key:2, label:"Portugues", menu:"portuguese"},
        ]
    },

    {
        name: "english",
        title: "English",
        message: "This menu is in english",
        options: [
            {key:0, label:"Back", menu:"welcome"}
        ]
    },

    {
        name: "portuguese",
        title: "Portugues",
        message: "Este menu está em portugues",
        options: [
            {key:0, label:"Voltar", menu:"welcome"}
        ]
    }
]

var bot = new Bot(
    {
        name: "bot", 
        entrypoint: 'welcome', 
        keyword: "@bot", 
        inline: false, 
        description: "This is an enquiry bot",
        sessionManager: new InMemorySessionManager(),
    }
);

bot.addJSONMenus(menus);

bot.addLocationInterceptor('*', () => {
    return {
        menu: {
            name: "*-intercepted",
            title: "*-Intercepted",
            message: "*-Intercepted",
            options: [
                {key:0, label:"Voltar", menu:"welcome"}
            ]
        }
    }
});

bot.addLocationInterceptor('welcome', () => {
    return {
        menu: {
            name: "welcome-intercepted",
            title: "Welcome-Intercepted",
            message: "Welcome-Intercepted",
            options: [
                {key:1, label:"English", menu:"english"},
                {key:2, label:"Portugues", menu:"portuguese"},
            ]
        }
    }
});

console.log(bot.process({msisdn:123, prompt:"@bot"}));
console.log(bot.process({msisdn:123, prompt:"1"}));
```