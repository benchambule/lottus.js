const {createBotFromJSON} = require('../../index.js');
const fs = require('fs');

function createBotFromFile(filename){
    const file_contents = fs.readFileSync(filename, 'utf8');

    const json = JSON.parse(file_contents);

    return createBotFromJSON(json);
}

let bot = createBotFromFile("./examples/json/enquiry.json");

(async function () {
    console.log("---------------------------------------------------------------");
    let session = await bot.process({msisdn: "123", prompt: "@bot"});
    console.log({msisdn: "123", prompt: "@bot"}, session);

    session = await bot.process({msisdn: "123", prompt: "1"}, session);
    console.log({msisdn: "123", prompt: "1"}, session);

    session = await bot.process({msisdn: "123", prompt: "Ben Chambule"}, session);
    console.log({msisdn: "123", prompt: "Ben Chambule"}, session);

    session = await bot.process({msisdn: "123", prompt: "23/04/1994"}, session);
    console.log({msisdn: "123", prompt: "23/04/1994"}, session);

    console.log("---------------------------------------------------------------");
    session = await bot.process({msisdn: "123", prompt: "@bot"}, session);
    console.log({msisdn: "123", prompt: "@bot"}, session);

    session = await bot.process({msisdn: "123", prompt: "1"}, session);
    console.log({msisdn: "123", prompt: "1"}, session);

    session = await bot.process({msisdn: "123", prompt: "0"}, session);
    console.log({msisdn: "123", prompt: "0"}, session);
})();
