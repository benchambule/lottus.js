const assert = require('assert');

const {Bot, InMemorySessionManager} = require('../index');

const createInquiryBot = () => {
    var bot = new Bot({
            name: 'enquiry-bot',
            entrypoint: 'main',
            keyword: '@enq',
            inline: false
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

describe('Tags', function(){
    it('should be able to store and retrieve tags', function(){
        const bot = createInquiryBot();

        var session = bot.process({'msisdn': '123', "prompt": "@enq"});
        session = bot.process({'msisdn': '123', "prompt": "Ben Chambule"}, session);
        const menu = bot.process({'msisdn': '123', "prompt": "30"}, session).menu;

        assert.equal(menu.message, "Provided information\nName: Ben Chambule\nAge: 30");
    });
});