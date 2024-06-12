const assert = require('assert');

var {Bot} = require('../index');


function createBot(){
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

    return bot;
}


describe('interceptors', function() {
    describe('inline bots', function() {
        it('inline bot must return the correct menu', function(){
            var bot = new Bot({
                name: "divider", 
                entrypoint: 'divider', 
                keyword: "@divider", 
                inline: true,
                description: 'Display random divider'
            });

            bot.intercept('divider', function(req){
                const reqs = req.prompt.trim().split(" ");
                if(reqs.length < 3){
                    return {
                        menu: {
                            message: "Please provide the dividend and the divisor"
                        }
                    }
                }

                if(parseInt(reqs[2]) === 0){
                    return {
                        menu: {
                            message: "Division by zero is not allowed"
                        }
                    }
                }
            });

            bot.at('divider', function(req){
                const reqs = req.prompt.trim().split(" ");

                const a = reqs[1];
                const b = reqs[2];

                return {
                    menu: {
                        message: a + " / " + b + " = " + (parseInt(a) / parseInt(b))
                    }
                }
            });

            const result = bot.process({msisdn: '123', prompt:"@divider 10 5"});
            assert.equal(result.menu.message, "10 / 5 = 2");

            assert.equal(bot.process({msisdn: '123', prompt:"@divider 10 0"}).menu.message, "Division by zero is not allowed");
            assert.equal(bot.process({msisdn: '123', prompt:"@divider 10"}).menu.message, "Please provide the dividend and the divisor");
        });
    });

    describe('non-inline bots', function() {
        it('non-inline bot must return the correct menu', function(){
            const bot = createBot();

            var session = bot.process({msisdn:123, prompt:"@bot"});
            assert.equal(session.menu.name, "welcome-intercepted");

            session = bot.process({msisdn:123, prompt:"1"}, session);
            assert.equal(session.menu.name, "*-intercepted");
        });
    });
});