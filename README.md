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
        description: "Reverses a provided string",
    }
);

reverse.at('main', async function(request){
    const sentence = request.sentence;
    const menu = {
        text: '👉 ' + sentence.split("").reverse().join(""), 
        final: true
    }

    return {
        menu: menu
    };
});

(async () => {
    let result = await reverse.process({msisdn: 123, prompt:"@reverse", sentence: "giberish"}, null);
    console.log(result.menu);

    result = await reverse.process({msisdn: 123, prompt:"@reverse", sentence: "bonjour le monde"});
    console.log(result.menu);

    result = await reverse.process({msisdn: 123, prompt:"@reverse", sentence: "ola mundo"});
    console.log(result.menu);

    result = await reverse.process({msisdn: 123, prompt:"@reverse", sentence: "hello world"});
    console.log(result.menu);
})();
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
        description: "Reverses a provided string" 
    }
);

reverse.intercept('main', async (request) => {
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

reverse.at('main', async function(request){
    const txt = request.lang == 'pt'? 'Frase invertida' : 'Reversed sentence';
    const prompt = request.sentence;
    const menu = {
        title: txt,
        text: prompt.split("").reverse().join(""), 
        final: true
    }

    return {
        menu: menu
    };
});

console.log(await reverse.process({msisdn: 123, prompt:"@reverse giberish"}));
console.log(await reverse.process({msisdn: 123, prompt:"@reverse bonjour le monde", lang:"fr"}));
console.log(await reverse.process({msisdn: 123, prompt:"@reverse ola mundo", lang:"pt"}));
console.log(await reverse.process({msisdn: 123, prompt:"@reverse hello world", lang:"en"}));
```

Let's build another bot, this time it will have 3 menus and the user can navigate back and forth between between the menus. For this bot, we will need a session manager/storage implementation that the bot will use.

```javascript
'use strict';

const {Bot} = require('lottus.js');

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
        description: "This is an enquiry bot",
    }
);

bot.addMenus(menus);

(async () => {
    let session = await bot.process({msisdn:123, prompt:"@bot"});
    console.log(session.menu);

    session = await bot.process({msisdn:123, prompt:"1"}, session);
    console.log(session.menu);

    session = await bot.process({msisdn:123, prompt:"0"}, session);
    console.log(session.menu);

    session = await bot.process({msisdn:123, prompt:"2"}, session);
    console.log(session.menu);
})();
```

Let's now ensure that only the msisdn 123 can use the above bot

```javascript
'use strict';

const {Bot} = require('lottus.js');

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
        description: "This is an enquiry bot",
    }
);

bot.addMenus(menus);

bot.intercept('*', async function(request){
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

(async () => {
    let session = await bot.process({msisdn:1234, prompt:"@bot"});
    console.log(session.menu);

    session = await bot.process({msisdn:123, prompt:"@bot"});
    console.log(session.menu);

    session = await bot.process({msisdn:123, prompt:"1"}, session);
    console.log(session.menu);

    session = await bot.process({msisdn:123, prompt:"0"}, session);
    console.log(session.menu);

    session = await bot.process({msisdn:123, prompt:"2"}, session);
    console.log(session.menu);
})();
```