'use strict';

const {Bot} = require('../../index');

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

let bot = new Bot({
    name: "bot", 
    entrypoint: 'welcome', 
    keyword: "@bot", 
    description: "This is an enquiry bot"
});

bot.addMenus(menus);

bot.intercept('*', async () => {
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

bot.intercept('welcome', async () => {
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

(async function (){
    console.log("---------------------------------------------------------------");
    let session = await bot.process({msisdn:123, prompt:"@bot"});
    console.log({msisdn:123, prompt:"@bot"}, session);

    session = await bot.process({msisdn:123, prompt:"1"}, session);
    console.log({msisdn:123, prompt:"1"}, session);
})();