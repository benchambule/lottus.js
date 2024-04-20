const {createBotFromFile} = require('../../helpers.js');
const {InMemorySessionManager} = require('../../index.js');

var bot = createBotFromFile("./examples/json/bot.json", new InMemorySessionManager());

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
console.log({msisdn:"1223", prompt: "@bot"}, bot.process({msisdn:"1223", prompt: "@bot"}));
console.log({msisdn:"1223", prompt: "1"}, bot.process({msisdn:"1223", prompt: "1"}));
console.log({msisdn:"1223", prompt: "4"}, bot.process({msisdn:"1223", prompt: "4"}));