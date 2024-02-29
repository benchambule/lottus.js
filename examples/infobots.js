'use strict';

const {Bot, Menu, Option, createBotsFromFile, InMemorySessionManager} = require('../index');


function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var app = createBotsFromFile('examples/infobots.json', new InMemorySessionManager());

app.getBot('main_bot').addProcessor('language', function(){
    return new Menu({
        name: 'language',
        title: '🇲🇿 Escolha idioma 🇵🇹 | 🇲🇿 Choose language 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        final: false,
        options: [
            new Option('1', '🇲🇿 Português 🇵🇹', 'portugues'),
            new Option('2', '🇲🇿 English 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'english'),
        ]
    });
});

app.getBot('main_bot').addProcessor('fotos', function(){
    return new Menu({
        name: 'fotos', 
        title: '🏞️ Fotos aleatórios ⭐📷', 
        final: false,
        medias: [ 
            { 
                url: "resources/imgs/pt/"+randomInteger(1, 9).toString()+".jpg", 
                type: "jpg", 
                caption: "This is a caption" 
            } 
        ],
        options: [
            new Option('0', 'Voltar', 'portugues'),
        ]
    });
});

app.getBot('main_bot').addProcessor('photos', function(){
    return new Menu({
        name: 'photos', 
        title: '🏞️ Random photos ⭐📷', 
        final: false,
        medias: [
            {
                url: "resources/imgs/en/"+randomInteger(1, 9).toString()+".jpg",
                type: "jpg",
                caption: "This is a caption" 
            }
        ],
        options: [
            new Option('0', 'Back', 'english'),
        ]
    });
});

var photoBot = new Bot(
    {
        name: "photos_bot", 
        entrypoint: 'photos', 
        keyword: "@photos", 
        inline: true,
        description: 'Display random photos'
    }
)

photoBot.addProcessor('photos', function(){
    return new Menu({
        name: 'photos',
        title: '🏞️ Random photos ⭐📷',
        final: false,
        medias: [{url: "resources/imgs/en/"+randomInteger(1, 9).toString()+".jpg", type: "jpg", caption: "This is a caption" }]
    });
});

app.addBot(photoBot);


var fotoBot = new Bot(
    {
        name: "fotos_bot", 
        entrypoint: 'fotos', 
        keyword: "@fotos", 
        inline: true,
        description: 'Mostrar fotos aleatórios'
    }
)

fotoBot.addProcessor('fotos', function(){
    return new Menu({
        title: '🏞️ Fotos aleatorias ⭐📷',
        medias: [{url: "resources/imgs/pt/"+randomInteger(1, 9).toString()+".jpg", type: "jpg", caption: "This is a caption" }]
    });
});

app.addBot(fotoBot);


console.log(app.process({msisdn: "123", prompt: "@bot"}));
console.log(app.process({msisdn: "123", prompt: "1"}));
console.log(app.process({msisdn: "123", prompt: "6"}));

console.log(app.process({msisdn: "123", prompt: "!help"}));
console.log(app.process({msisdn: "123", prompt: "ola"}));

console.log(app.process({msisdn: "123", prompt: "@photos", lang: 'pt'}));
console.log(app.process({msisdn: "123", prompt: "@photos", lang: 'en'}));
console.log(app.process({msisdn: "123", prompt: "@fotos"}));
console.log(app.process({msisdn: "123", prompt: "!ajuda"}));

console.log(app.process({msisdn: "123", prompt: "@bot"}));
console.log(app.process({msisdn: "123", prompt: "1"}));
console.log(app.process({msisdn: "123", prompt: "6"}));
console.log(app.process({msisdn: "123", prompt: "0"}));
console.log(app.process({msisdn: "123", prompt: "@sair"}));