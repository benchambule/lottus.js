'use strict';
(async function () {
    const {Bot} = require('../index');

    var bot = new Bot({
        name: 'barber',
        entrypoint: 'main',
        keyword: '@barber',
    });

    

    bot.at('main', async() => {
        const menu = {
            name: 'main', 
            title: 'Welcome to Barbershop', 
            text: 'Select an option',
            options: [
                {key: '1', label: 'Information', menu: 'info'},
                {key: '2', label: 'Location', menu: 'location'},
            ]
        }

        return {
            menu: menu
        }
    });

    bot.at('info', async () => {
        return {
            menu: {
                name: 'info', 
                title: 'Information', 
                text: 'Barbershop info', 
                final: true
            }
        }
    });

    bot.at('location', async () => {
        return {
            menu: {
                name: 'location',
                title: 'Location',
                text: 'Barbershop location',
                options: [
                    {key: '1', label: 'Information', menu: 'info'},
                    {key: '2', label: 'Location', menu: 'location'},
                ]
            }
        }
    });

    bot.at('info', async function(){
        return {
            menu: {
                name: 'info', 
                title: 'Information', 
                text: 'Barbershop info', 
                final: true
            }
        }
    });

    bot.intercept("*", async function(req){
        if(req.prompt == '.exit'){
            return {
                menu: {
                    message: 'Bye',
                    final: true,
                }
            }
        }
    });

    let session = await bot.process({msisdn: '123', prompt: '@barber'});
    console.log(session.menu);

    session = await bot.process({msisdn: '123', prompt: 'hello'}, session);
    console.log(session.menu);

    session = await bot.process({msisdn: '123', prompt: '@barber'}, session);
    console.log(session.menu);

    session = await bot.process({msisdn: '123', prompt: '.exit'}, session);
    console.log(session.menu);

    session = await bot.process({msisdn: '123', prompt: '@barber'}, session);
    console.log(session.menu);

    session = await bot.process({msisdn: '123', prompt: '1'}, session);
    console.log(session.menu);

    session = await bot.process({msisdn: '123', prompt: '@barber'}, session);
    console.log(session.menu);

    session = await bot.process({msisdn: '123', prompt: '2'}, session);
    console.log(session.menu);
})();
