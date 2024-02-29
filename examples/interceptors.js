'use strict';

const {Bot, Menu, Option, createBotsFromFile, InMemorySessionManager} = require('../index');

var sessionManager = new InMemorySessionManager();

function createBarberShopBot() {
    return new Bot({
            name: 'barber',
            entrypoint: 'main',
            keyword: '@barber',
            menus: [
                new Menu({
                    name: 'main', 
                    title: 'Welcome to Barbershop', 
                    text: 'Select an option', 
                    final: false, 
                    options: [
                        new Option('1', 'Information', 'info'),
                        new Option('2', 'Location', 'location'),
                    ]
                }),

                new Menu({
                    name: 'info', 
                    title: 'Information', 
                    text: 'Barbershop info', 
                    final: true}
                ),

                new Menu({
                    name: 'location',
                    title: 'Location', 
                    text: 'Barbershop location', 
                    final: false, 
                    options: [
                        new Option('0', 'Back', 'main')
                    ]
                }),

                new Menu({name: 'exit', title: 'Thank you', text: 'Thanks for the contact', final: true})
            ],
            inline: false,
            sessionManager : sessionManager
        }
    );
}

const a = createBarberShopBot();
const b = createBarberShopBot();

a.addInterceptor('location', function(request){
    console.log(request);

    return new Menu(
        {
            name: 'interceptor', 
            title: 'From interceptor', 
            text: 'The interceptor is working', 
            final: true
        }
    );
});

b.addInterceptor('*', function(request){
    console.log(request);

    return new Menu(
        {
            name: 'super interceptor', 
            title: 'From super interceptor', 
            text: 'The super interceptor is working', 
            final: true
        }
    );
});


console.log("@barber", b.process({msisdn: "123", prompt: "@barber"}));

console.log("@barber", a.process({msisdn: "123", prompt: "@barber"}));
console.log("2", a.process({msisdn: "123", prompt: "2"}));
console.log("0", a.process({msisdn: "123", prompt: "0"}));


var c = createBarberShopBot();

c.addInterceptor('main', function(request){
    console.log("From interceptor", "main");

    return new Menu({
        name: 'principal', 
        title: 'Welcome to my shop', 
        text: 'Select an option', 
        final: false, 
        options: [
            new Option('1', 'Information', 'info'),
            new Option('2', 'Location', 'location'),
        ]
    });
});

console.log(sessionManager);

c.addProcessor('principal', function(request){
    console.log("From processor", "principal");

    if(request.prompt == '1'){
        return new Menu({
            name: 'info', 
            title: 'Information', 
            text: 'Barbershop info', 
            final: true
        });
    }else if(request.prompt == '2'){
        return new Menu({
            name: 'location', 
            title: 'Location', 
            text: 'Barbershop location', 
            final: false, 
            options: [
                new Option('0', 'Back', 'main')
            ]
        });
    }

});

console.log("==>@barber", c.process({msisdn: "123", prompt: "@barber"}));
console.log("==>1", c.process({msisdn: "123", prompt: "1"}));