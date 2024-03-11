'use strict';

const {Bot, InMemorySessionManager} = require('../index');

var sessionManager = new InMemorySessionManager();

function createInquiryBot() {
    var bot = new Bot({
            name: 'enquiry-bot',
            entrypoint: 'main',
            keyword: '@enq',
            inline: false,
            debug: true,
            sessionManager : sessionManager
        }
    );

    bot.addLocationProcessor('main', function(req, tags, ctx){
        const menu = {
            name: 'main',
            title: "Welcome to Ben's bot",
            message: "Please provide your name",
            next_menu: 'age'
        }

        return {
            menu: menu,
            tags: tags
        }
    });

    bot.addLocationProcessor('age', function(req, tags, ctx){
        const menu = {
            name: 'age',
            title: "Welcome to Ben's bot",
            message: "Please provide your age",
            next_menu: 'show_info'
        }

        tags['name'] = req.prompt;

        return {
            menu: menu,
            tags: tags
        }
    });

    bot.addLocationProcessor('show_info', function(req, tags, ctxt){
        tags['age'] = req.prompt;
        const menu = {
            name: 'show_info',
            title: "Welcome to Ben's bot",
            message: "Provided information\n" + "Name: {{name}}\nAge: {{age}}",
            final: true
        }

        return {
            menu: menu,
            tags: tags
        }
    });

    return bot;
}

const a = createInquiryBot();
console.log(a);

console.log(a.process({'msisdn': '123', "prompt": "@enq"}));
console.log(a.process({'msisdn': '123', "prompt": "Ben Chambule"}));
console.log(a.process({'msisdn': '123', "prompt": "30"}));
