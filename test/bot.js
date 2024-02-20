const assert = require('assert');

var {Bot, Menu, Option} = require('../index');


describe('Bot', function() {
    describe('inline bots', function() {
        it('should be an inline bot', function(){
            var bot = new Bot({
                name: "adder_bot", 
                entrypoint: 'adder', 
                keyword: "@adder", 
                inline: true,
                description: 'Display random adder'
            })

            assert.equal(bot.inline, true);
        });

        it('should have a name', function(){
            var bot = new Bot({
                name: "adder_bot",
                entrypoint: 'adder',
                keyword: "@adder",
                inline: true,
                description: 'Display random adder'
            })

            assert.equal(bot.name, "adder_bot");
        });

        it('should have a description', function(){ 
            var bot = new Bot({
                name: "adder_bot",
                entrypoint: 'adder',
                keyword: "@adder",
                inline: true,
                description: 'Display random adder'
            })

            assert.equal(bot.description, "Display random adder");
        });

        it('should have a keyword', function(){
            var bot = new Bot({
                name: "adder_bot",
                entrypoint: 'adder',
                keyword: "@adder",
                inline: true,
                description: 'Display random adder'
            })

            assert.equal(bot.keyword, "@adder");
        });

        it('should have an entrypoint', function(){
            var bot = new Bot({
                name: "adder_bot",
                entrypoint: 'adder',
                keyword: "@adder",
                inline: true,
                description: 'Display random adder'
            })

            assert.equal(bot.entrypoint, "adder");
        });

        it('should have an exit point', function(){
            var bot = new Bot({
                name: "adder_bot",
                entrypoint: 'adder',
                keyword: "@adder",
                inline: true,
                description: 'Display random adder',
            })

            assert.equal(bot.exitpoint, "exit");
        });

        it('should have an exit word', function(){
            var bot = new Bot({
                name: "adder_bot",
                entrypoint: 'adder',
                keyword: "@adder",
                inline: true,
                description: 'Display random adder'
            })

            assert.equal(bot.exitword, "@exit");
        });

        it('should have menus', function(){
            var bot = new Bot({
                name: "display_bot",
                entrypoint: 'main',
                keyword: "@echo",
                inline: true,
                description: 'Returns what you wrote to it',
                menus: [
                    new Menu({name: 'main', title: 'Hello', text:'-->{{$@}}'})
                ]
            });

            assert.equal(bot.getMenu('main').name, 'main');
        });
    });
});