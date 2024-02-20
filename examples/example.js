'use strict';

const {Bot, Menu, Option, createBotsFromFile, InMemorySessionManager} = require('../index');


function createDisplayBot() {
    return new Bot(
        {
            name: 'bot',
            entrypoint: 'main',
            keyword: '@display',
            menus:[
                new Menu({name: 'main', title: 'Hello', text:'-->{{$@}}'})
            ],
            inline: true
        }
    );
}

const app = createDisplayBot();

console.log(app.process({msisdn: "123", command: "@display hello world"}));
console.log(app.process({msisdn: "123", command: "hello world"}));
var sessionManager = new InMemorySessionManager();

function createBarberShopBot() {
    return new Bot({
            name: 'barber',
            entrypoint: 'main',
            keyword: '@fake-barber',
            menus: [
                new Menu({
                    name: 'main', 
                    title: 'Bem vindo', 
                    text: 'Escolha uma opção', 
                    final: false, 
                    options: [
                        new Option('1', 'Informações', 'info'),
                        new Option('2', 'Localização', 'location'),
                    ]
                }),

                new Menu({
                    name: 'info', 
                    title: 'Informaçōes', 
                    text: 'Info do barbershop', 
                    final: true}
                ),

                new Menu({
                    name: 'location',
                    title: 'Localização', 
                    text: 'Location do barbershop', 
                    final: false, 
                    options: [
                        new Option('0', 'Voltar', 'main')
                    ]
                }),

                new Menu({name: 'exit', title: 'Thank you', text: 'Obrigado por nos contactar', final: true})
            ],
            inline: false,
            sessionManager : sessionManager
        }
    );
}

const b_app = createBarberShopBot()

console.log("@fake-barber", b_app.process({msisdn: "123", command: "@fake-barber"}));
console.log("1", b_app.process({msisdn: "123", command:"1"}));

console.log("@fake-barber", b_app.process({msisdn: "123", command: "@fake-barber"}));
console.log("2", b_app.process({msisdn: "123", command: "2"}));
console.log("0", b_app.process({msisdn: "123", command: "0"}));
console.log(sessionManager );
console.log("@exit", b_app.process({msisdn: "123", command: "@exit"}));


const bots = createBotsFromFile('examples/example.json', new InMemorySessionManager());
var bot = new Bot(
    {
        name: "marcar", 
        entrypoint: 'main', 
        keyword: "@marcar", 
        inline: true, 
        description: "Marcar visita" 
    }
)

bot.addProcessor('main', function(request, tags){
    return new Menu(
        {
            name: null, 
            title: "Marcar visita", 
            message: "Marcacao para dia " + request.msisdn + " feita com sucesso", 
            final: true
        }
    )}
);

var reverse_bot = new Bot(
    {
        name: "reverse", 
        entrypoint: 'main', 
        keyword: "@reverse", 
        inline: true, 
        description: "Reverses a provided string" 
    }
)

var addbot = new Bot(
    {
        name: "add", 
        entrypoint: 'main', 
        keyword: "!add", 
        inline: true, 
        description: "Add two objects" 
    }
)

reverse_bot.addProcessor('main', function(request){
    return new Menu(
        {
            name: null, 
            title: "Reverse", 
            text: "$ " + request.command.trim().split("").reverse().join(""), 
            final: true
        }
    )}
);

addbot.addProcessor('main', function(request){
    const numbers = request.command.replace(",", ".").trim().split(" ");

    const a = parseFloat(numbers[0]);
    const b = parseFloat(numbers[1]);

    return new Menu(
        {
            name: null, 
            title: "Add", 
            text: "$ " + a + " + " + b + " = " + (a + b), 
            final: true
        }
    )}
);

bots.addBot(bot);
bots.addBot(reverse_bot);
bots.addBot(addbot);

console.log("this", bots.process({msisdn: "123", command: "@marcar 1"}))

console.log(bots.process({msisdn: "123", command: "@servicos"}));

console.log(bots.process({msisdn: "123", command: "@barber"}));
console.log(bots.process({msisdn: "123", command: "2"}));

console.log(bots.process({msisdn: "123", command: "@barber"}));
console.log(bots.process({msisdn: "123", command: "1"}));
console.log(bots.process({msisdn: "123", command: "27/02/2024 10:30"}));
console.log(bots.process({msisdn: "123", command: "1"}));


console.log(bots.process({msisdn: "123", command: "@barber"}));
console.log(bots.process({msisdn: "123", command: "@horarios"}));

console.log(bots.process({msisdn: "123", command: "!ajuda"}));

console.log(bots.process({msisdn: "123", command: "@nothing"}));

console.log(bots.process({msisdn: "123", command: "@reverse benjamim chambule"}));

console.log(reverse_bot.process({msisdn: "123", command: "@reverse benjamim chambule"}));

console.log(bots.process({msisdn: "123", command: "!add 123.5 124"}));
console.log(bots.process({msisdn: "123", command: "!add 123,5 124"}));
console.log(bots.process({msisdn: "123", command: "!add 123.5 hat"}));
console.log(bots.process({msisdn: "123", command: "!add 123.5"}));



var addbot = new Bot(
    {
        name: "subtract", 
        entrypoint: 'main', 
        keyword: "!sub", 
        inline: true, 
        description: "Subtrcat two objects" 
    }
)

addbot.addProcessor('main', function(request){
    const numbers = request.command.replace(", ", ".").trim().split(" ");

    const a = parseFloat(numbers[0]);
    const b = parseFloat(numbers[1]);
    
    // insert 

    return new Menu(
        {
            name: null,
            title: "Subtract",
            text: "$ " + a + " - " + b + " = " + (a - b),
            final: true
        }
    )}
)


console.log(addbot.process({msisdn: "123", command: "!sub 150 124"}));


var divideBot = new Bot(
    {
        name: "Divide", 
        entrypoint: 'startpoint', 
        keyword: "!div", 
        inline: true, 
        description: "Divide two objects",
        menus: [
            new Menu(
                {
                    name: 'startpoint',
                    title: 'Divide', 
                    text: 'Divide 10 by 1 = 10', 
                    final: true
                }
            )
        ]
    }
)

console.log(divideBot.process({msisdn: "123", command: "!div 10 1"}));

console.log(bots.process({msisdn: "123", command: "!help"}));