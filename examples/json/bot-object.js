'use strict';

const {Bot, InMemorySessionManager} = require('../../index');

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

bot.addMenus(menus);

bot.intercept('*', () => {
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

bot.intercept('welcome', () => {
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

console.log("---------------------------------------------------------------");
console.log({msisdn:123, prompt:"@bot"}, bot.process({msisdn:123, prompt:"@bot"}));
console.log({msisdn:123, prompt:"1"}, bot.process({msisdn:123, prompt:"1"}));
