'use strict';

const App = require('./src/App');
const Bot = require('./src/Bot');
const fs = require('fs');


function createBotsFromFile(filename, sessionManager){
    var app = new App(sessionManager);

    const file = JSON.parse(fs.readFileSync(filename, 'utf8'));

    const bots = file['bots'];

    bots.forEach(bot => {
        const entrypoint = bot['entrypoint'];
        const keyword = bot['keyword'];
        const name = bot['name'];
        const inline = bot['inline'];
        const menus = bot['menus'];
        const description = bot['description'];
        const exitword = bot['exitword'];
        const exitpoint = bot['exitpoint'];

        app.addBot(
            new Bot(
                {
                    name: name,
                    entrypoint: entrypoint,
                    keyword: keyword,
                    menus: menus,
                    inline: inline,
                    sessionManager: inline?null:sessionManager,
                    description: description,
                    exitpoint: exitpoint,
                    exitword: exitword
                }
            )
        );

    })

    return app;
}

module.exports = {
    Bot: Bot,
    App: App,
    Menu: require('./src/Menu'),
    Option: require('./src/Option'),
    Session: require('./src/Session'),
    SessionManager: require('./src/SessionManager'),
    InMemorySessionManager: require('./src/InMemorySessionManager'),

    version: require('./package.json'),

    createBotsFromFile: createBotsFromFile,
}