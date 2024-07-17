(async function () {
    const fs = require('fs');
    const {createBotFromJSON} = require('../../index');

    function createBotFromFile(filename){
        const file_contents = fs.readFileSync(filename, 'utf8');

        const json = JSON.parse(file_contents);

        return createBotFromJSON(json);
    }

    const bot = createBotFromFile("./examples/json/bot.json");

    bot.at('language', async function(){
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
    let session = await bot.process({msisdn:"1223", prompt: "@bot"});
    console.log({msisdn:"1223", prompt: "@bot"}, session);
    
    session = await bot.process({msisdn:"1223", prompt: "1"}, session);
    console.log({msisdn:"1223", prompt: "1"}, session);

    session = await bot.process({msisdn:"1223", prompt: "4"}, session);
    console.log({msisdn:"1223", prompt: "4"}, session);
})();
