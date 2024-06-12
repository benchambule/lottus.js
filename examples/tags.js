'use strict';

const {Bot} = require('../index');

function createInquiryBot() {
    var bot = new Bot({
            name: 'enquiry-bot',
            entrypoint: 'main',
            keyword: '@enq',
            inline: false,
            debug: true
        }
    );

    bot.at('main', function(req, tags){
        const menu = {
            name: 'main',
            title: "Welcome to Ben's bot",
            message: "Please provide your name",
            next: 'age'
        }

        return {
            menu: menu,
            tags: tags
        }
    });

    bot.at('age', function(req, tags){
        const menu = {
            name: 'age',
            title: "Welcome to Ben's bot",
            message: "Please provide your age",
            next: 'show_info'
        }

        tags['name'] = req.prompt;

        return {
            menu: menu,
            tags: tags
        }
    });

    bot.at('show_info', function(req, tags){
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

console.log("---------------------------------------------------------------");
var session = a.process({'msisdn': '123', "prompt": "@enq"}, null);
console.log({'msisdn': '123', "prompt": "@enq"}, session);

session = a.process({'msisdn': '123', "prompt": "Ben Chambule"}, session);
console.log({'msisdn': '123', "prompt": "Ben Chambule"}, session);

session = a.process({'msisdn': '123', "prompt": "30"}, session);
console.log({'msisdn': '123', "prompt": "30"}, session);
