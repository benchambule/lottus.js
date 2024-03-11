const {createBotFromFile} = require('../../helpers.js');
const {InMemorySessionManager} = require('../../index.js');

var bot = createBotFromFile("./examples/json/enquiry.json", new InMemorySessionManager());
// bot.debug = true;

console.log(bot.process({msisdn: "123", prompt: "@bot"}));
console.log(bot.process({msisdn: "123", prompt: "1"}));
console.log(bot.process({msisdn: "123", prompt: "Ben Chambule"}));
console.log(bot.process({msisdn: "123", prompt: "23/04/1994"}));

console.log(bot.process({msisdn: "123", prompt: "@bot"}));
console.log(bot.process({msisdn: "123", prompt: "1"}));
console.log(bot.process({msisdn: "123", prompt: "0"}));