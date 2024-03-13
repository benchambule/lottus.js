const assert = require('assert');

var {Bot} = require('../index');


describe('Inline bots', function() {
    it('inline bot must return the correct menu', function(){
        var bot = new Bot({
            name: "adder_bot", 
            entrypoint: 'adder', 
            keyword: "@adder", 
            inline: true,
            description: 'Display random adder'
        });

        bot.addLocationProcessor('adder', function(req){
            const reqs = req.prompt.trim().split(" ");

            const a = reqs[1];
            const b = reqs[2];

            return {
                menu: {
                    message: a + " + " + b + " = " + (parseInt(a) + parseInt(b))
                }
            }
        });

        const result = bot.process({msisdn: '123', prompt:"@adder 10 20"});
        assert.equal(result.message, "10 + 20 = 30");
    });
});