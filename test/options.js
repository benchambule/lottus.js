const assert = require('assert');

const {Bot} = require('../index');

const createOptionsBot = () => {
    let info = new Bot(
        {
            name: "info-bot", 
            entrypoint: 'main', 
            keyword: "@info", 
            inline: false, 
            description: "Reverses a provided string",
        }
    );
    
    info.at('main', async () => {
        const menu = {
            name: 'main',
            title: "Welcome to Ben's bot",
            message: "Select an option",
            options: [
                {key: 1, label: "name", menu: "name"},
                {key: 2, label: "profession", menu: "profession"},
                {key: 3, label: "age", menu: "age"},
                {key: 4, label: "country", menu: "country"}
            ]
        }
        return {
            menu: menu
        };
    });
    
    info.at('profession', async () => {
        const menu = {
            name: 'profession',
            title: "Ben's profession",
            message: "Data Engineer @ VM",
            options: [
                {key: 0, label: "back", menu: "main"},
            ]
        }
        return {
            menu: menu
        };
    });
    
    info.at('name', async () => {
        const menu = {
            name: "name",
            title: "Ben's full name",
            message: "Benjamim J. Chambule",
            options: [
                {key: 0, label: "back", menu: "main"},
            ]
        }
        return {
            menu: menu
        };
    });
    
    info.at('age', async () => {
        const menu = {
            name: "age",
            title: "Ben's age",
            message: "Ben's age is 30",
            options: [
                {key: 0, label: "back", menu: "main"},
            ]
        }
        return {
            menu: menu
        };
    });
    
    info.at('country', async () => {
        const menu = {
            name: "country",
            title: "Ben's country",
            message: "Ben's country is Mozambique",
            options: [
                {key: 0, label: "back", menu: "main"},
            ]
        }
        return {
            menu: menu
        };
    });
    
    info.intercept('*', async function(request, tags, ctxt){
        if(request.prompt.trim() === '@exit'){
            return {
                menu: {
                    name: "@exit",
                    title: "Thank you for using Ben's bot",
                    final: true
                }
            }
        }
    });

    return info;
}

describe('options', function() {
    it('bot must return the correct selected menu', function() {
        (async () => {
            const bot = createOptionsBot();
            
            let session = await bot.process({msisdn: "1234", prompt: '@info'});
            assert.equal(session.menu.name, 'main');

            session = await bot.process({msisdn: "1234", prompt: '1'}, session);
            assert.equal(session.menu.name, 'name');

            session = await bot.process({msisdn: "1234", prompt: '@info'}, session);
            assert.equal(session.menu.name, 'main');

            session = await bot.process({msisdn: "1234", prompt: '2'}, session);
            assert.equal(session.menu.name, 'profession');

            session = await bot.process({msisdn: "1234", prompt: '0'}, session);
            assert.equal(session.menu.name, 'main');

            session = await bot.process({msisdn: "1234", prompt: '3'}, session);
            assert.equal(session.menu.name, 'age');

            session = await bot.process({msisdn: "1234", prompt: '0'}, session);
            assert.equal(session.menu.name, 'main');

            session = await bot.process({msisdn: "1234", prompt: '4'}, session);
            assert.equal(session.menu.name, 'country');
        })();
    });
});