const {createBotFromFile} = require('../../helpers.js');
const {InMemorySessionManager} = require('../../index.js');

var bot = createBotFromFile("./examples/json/enquiry.json", new InMemorySessionManager());

console.log("---------------------------------------------------------------");
console.log({msisdn: "123", prompt: "@bot"}, bot.process({msisdn: "123", prompt: "@bot"}));
console.log({msisdn: "123", prompt: "1"}, bot.process({msisdn: "123", prompt: "1"}));
console.log({msisdn: "123", prompt: "Ben Chambule"}, bot.process({msisdn: "123", prompt: "Ben Chambule"}));
console.log({msisdn: "123", prompt: "23/04/1994"}, bot.process({msisdn: "123", prompt: "23/04/1994"}));

console.log("---------------------------------------------------------------");
console.log({msisdn: "123", prompt: "@bot"}, bot.process({msisdn: "123", prompt: "@bot"}));
console.log({msisdn: "123", prompt: "1"}, bot.process({msisdn: "123", prompt: "1"}));
console.log({msisdn: "123", prompt: "0"}, bot.process({msisdn: "123", prompt: "0"}));