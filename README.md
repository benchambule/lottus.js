# lottus.js
=====================

### Installation
```bash
npm i 'github:benchambule/lottus.js#main'  
```

### Examples
---------------------
Let's build a bot that reverses a string, and it is triggered by the _@reverse_ keyword. The bot will receive a sentence like _@reverse hello world_ and return _dlrow olleh_ as a response. This bot does not need a session because there's no follow-up requests

```javascript
'use strict';

const {Bot} = require('lottus.js');

var reverse = new Bot(
    {
        name: "reverse", 
        entrypoint: 'main', 
        keyword: "@reverse", 
        inline: true, // This bot is inline, so it won't create a session
        description: "Reverses a provided string" 
    }
);

reverse.at('main', function(request, context){
    const prompt = request.prompt.replace(context.bot.keyword, "").trim();
    const menu = {
        text: '👉 ' + prompt.split("").reverse().join(""), 
        final: true
    }

    return {
        menu: menu
    };
});

console.log(reverse.process({msisdn: 123, prompt:"@reverse giberish"}));
console.log(reverse.process({msisdn: 123, prompt:"@reverse bonjour le monde"}));
console.log(reverse.process({msisdn: 123, prompt:"@reverse ola mundo"}));
console.log(reverse.process({msisdn: 123, prompt:"@reverse hello world"}));
```

Let's update our previous bot to be respond accordind to the language. We will be listening to _request.lang_ to check if it's set to _'pt'_ or _'en'_. If the _request.lang_ is not set, we will default to _'en'_. If _request.lang_ is other than _'en'_ and _'pt'_ we will respond with a message informing the customer that the provided language is unknown or not implemented yet.

```javascript
'use strict';

const {Bot} = require('lottus.js');

var reverse = new Bot(
    {
        name: "reverse", 
        entrypoint: 'main', 
        keyword: "@reverse", 
        inline: true, // This bot is inline, so it won't create a session
        description: "Reverses a provided string" 
    }
);

reverse.intercept('main', (request) => {
    if(!request.lang){
        request.lang = 'en';
        return {
            request: request
        }
    }

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

console.log(reverse.process({msisdn: 123, prompt:"@reverse giberish"}));
console.log(reverse.process({msisdn: 123, prompt:"@reverse bonjour le monde", lang:"fr"}));
console.log(reverse.process({msisdn: 123, prompt:"@reverse ola mundo", lang:"pt"}));
console.log(reverse.process({msisdn: 123, prompt:"@reverse hello world", lang:"en"}));
```

Let's build another bot, this time it will have 3 menus and the user can navigate back and forth between between the menus. For this bot, we will need a session manager/storage implementation that the bot will use.

```javascript
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
        sessionManager: new InMemorySessionManager(), // This is where the session will be stored, an alternative implementation can be provided, i.e., file based or database based, or something else.
    }
);

bot.addMenus(menus);

console.log(bot.process({msisdn:123, prompt:"@bot"}));
console.log(bot.process({msisdn:123, prompt:"1"}));
```

Let's now ensure that only the msisdn 123 can use the above bot

```javascript
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
        sessionManager: new InMemorySessionManager(), // This is where the session will be stored, an alternative implementation can be provided, i.e., file based or database based, or something else.
    }
);

bot.addMenus(menus);

bot.intercept('*', function(request){
    if(request.msisdn.toString() !== '123'){
        const menu = {
            title: "This bot is only available for the msisdn 123",
            final: true
        };
        return {
            menu: menu
        }
    }
});

console.log(bot.process({msisdn:123, prompt:"@bot"}));
```