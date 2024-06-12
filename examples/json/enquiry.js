const {createBotFromFile} = require('../../helpers.js');

var bot = createBotFromFile("./examples/json/enquiry.json");

console.log("---------------------------------------------------------------");
var session = bot.process({msisdn: "123", prompt: "@bot"});
console.log({msisdn: "123", prompt: "@bot"}, session);

session = bot.process({msisdn: "123", prompt: "1"}, session);
console.log({msisdn: "123", prompt: "1"}, session);

session = bot.process({msisdn: "123", prompt: "Ben Chambule"}, session);
console.log({msisdn: "123", prompt: "Ben Chambule"}, session);

session = bot.process({msisdn: "123", prompt: "23/04/1994"}, session);
console.log({msisdn: "123", prompt: "23/04/1994"}, session);

console.log("---------------------------------------------------------------");
session = bot.process({msisdn: "123", prompt: "@bot"}, session);
console.log({msisdn: "123", prompt: "@bot"}, session);

session = bot.process({msisdn: "123", prompt: "1"}, session);
console.log({msisdn: "123", prompt: "1"}, session);

session = bot.process({msisdn: "123", prompt: "0"}, session);
console.log({msisdn: "123", prompt: "0"}, session);