'use strict';

const {Bot, InMemorySessionManager} = require('../index');

var sessionManager = new InMemorySessionManager();

var bot = new Bot({
    name: 'barber',
    entrypoint: 'main',
    keyword: '@barber',
    inline: false,
    sessionManager: sessionManager,
    debug: true
});

bot.addLocationProcessor('main', function(req, tags, ctxt){
   const menu = {
        name: 'main', 
        title: 'Welcome to Barbershop', 
        text: 'Select an option',
        options: [
            {key: '1', label: 'Information', next_menu: 'info'},
            {key: '2', label: 'Location', next_menu: 'location'},
        ]
    }

    return {
        menu: menu
    }
});

bot.addLocationProcessor('info', function(req, tags, ctxt){
    return {
        menu: {
            name: 'info', 
            title: 'Information', 
            text: 'Barbershop info', 
            final: true
        }
    }
});

bot.addLocationProcessor('location', function(req, tags, ctxt){
    return {
        menu: {
            name: 'location',
            title: 'Location',
            text: 'Barbershop location',
            options: [
                {key: '0', label: 'Back', next_menu: 'main'}
            ]
        }
    }
});

bot.addLocationInterceptor('info', function(req){
    if(req.prompt == 'hello'){
        return {
            message: 'Hi there',
            final: true
        };
    }
});

bot.addLocationInterceptor("*", function(req){
    console.log('interceptor called');
    if(req.prompt == '.exit'){
        return {
            menu: {
                message: 'Bye',
                final: true,
            }
        }
    }
});

// console.log(bot.process({msisdn: '123', prompt: '@barber'}));
// console.log(bot.process({msisdn: '123', prompt: 'hello'}));

console.log(bot.process({msisdn: '123', prompt: '@barber'}));
console.log(bot.process({msisdn: '123', prompt: '.exit'}));

// console.log(bot.process({msisdn: '123', prompt: '@barber'}));
// console.log(bot.process({msisdn: '123', prompt: '1'}));

// console.log(bot.process({msisdn: '123', prompt: '@barber'}));
// console.log(bot.process({msisdn: '123', prompt: '2'}));