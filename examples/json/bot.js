const {createBotFromFile} = require('../../helpers.js');
const {InMemorySessionManager} = require('../../index.js');

var bot = createBotFromFile("./examples/json/bot.json");

bot.at('language', function(){
    return {
        menu: {
            "name": "language",
            "title": "English | Portugues",
            "options": [
                {"key":"1", "label":"English", "menu":"english"},
                {"key":"2", "label":"Portugues", "menu":"portugues"}
            ]
        }
    }
});

console.log("---------------------------------------------------------------");
var session = bot.process({msisdn:"1223", prompt: "@bot"});
console.log({msisdn:"1223", prompt: "@bot"}, session);

session = bot.process({msisdn:"1223", prompt: "1"}, session);
console.log({msisdn:"1223", prompt: "1"}, session);

session = bot.process({msisdn:"1223", prompt: "4"}, session);
console.log({msisdn:"1223", prompt: "4"}, session);