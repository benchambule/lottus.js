'use strict';

const fs = require('fs');
const App = require('./App');
const Bot = require('./Bot');

function createBotFromJSON(json, sessionManager){

    const entrypoint = json['entrypoint'];
    const keyword = json['keyword'];
    const name = json['name'];
    const inline = json['inline'];
    const menus = json['menus'];
    const description = json['description'];
    const exitword = json['exitword'];
    const exitpoint = json['exitpoint'];

    const bot = new Bot(
        {
            name: name,
            entrypoint: entrypoint,
            keyword: keyword,
            inline: inline,
            sessionManager: inline?null:sessionManager,
            description: description,
            exitpoint: exitpoint,
            exitword: exitword
        }
    );

    menus.forEach(menu => {
        bot.at(menu.name, function(req, tags){
            if(menu.required && menu.required.regex){
                menu.required.regex = new RegExp(menu.required.regex);
            }
            
            return {
                menu: menu,
                tags: tags,
            }
        });
    });

    return bot;
}


function createAppFromJSON(json, sessionManager){
    var app = new App(sessionManager);

    const bots = json['bots'];

    bots.forEach(bot => {
        const _bot = createBotFromJSON(bot, sessionManager);

        app.addBot(_bot);
    });

    return app;
}


function createBotFromFile(filename, sessionManager){
    const file_contents = fs.readFileSync(filename, 'utf8');

    const json = JSON.parse(file_contents);

    return createBotFromJSON(json, sessionManager);
}


function createAppFromFile(filename, sessionManager){
    const file_contents = fs.readFileSync(filename, 'utf8');

    const json = JSON.parse(file_contents);

    return createAppFromJSON(json, sessionManager);
}

module.exports = {
    createBotFromFile: createBotFromFile,
    createAppFromFile: createAppFromFile,
    createBotFromJSON: createBotFromJSON,
    createAppFromJSON: createAppFromJSON
}
