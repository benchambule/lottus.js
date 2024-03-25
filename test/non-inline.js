const assert = require('assert');

var {Bot} = require('../index');


describe('Non-inline bots', function() {
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
});