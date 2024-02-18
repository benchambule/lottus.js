'use strict';

const {Bot, Menu, Option, createBotsFromFile} = require('../index');


class InMemorySessionStorage {
    constructor(){
        this.sessions = [];
    }

    getSession(msisdn){
        var session = null;
        this.sessions.forEach(element => {
            if (element !== null && element.msisdn === msisdn && element.active === true){
                session = element;
            }
        });

        return session;
    }

    saveSession(session){
        this.sessions.push(session);
    }

    endSession(session){
        const testing = (e) => e.msisdn === session.msisdn;

        const index = this.sessions.findIndex(testing);

        if(index > -1){
            this.sessions.splice(index, 1);
        }
    }

    updateSession(session){
        var ses = []
        
        for(var i = 0; i < this.sessions.length; i++){
            if(this.sessions[i] !== null && this.sessions[i].id !== session.id) {
                ses.push(session);
            }
        }

        var n_session = session;

        ses.push(n_session);

        this.sessions = ses;
    }
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var app = createBotsFromFile('examples/infobots.json', new InMemorySessionStorage());

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
        media: [ { url: "resources/imgs/pt/"+randomInteger(1, 9).toString()+".jpg", type: "jpg", caption: "This is a caption" } ],
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
        media: [{url: "resources/imgs/en/"+randomInteger(1, 9).toString()+".jpg", type: "jpg", caption: "This is a caption" }],
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
        media: [{url: "resources/imgs/en/"+randomInteger(1, 9).toString()+".jpg", type: "jpg", caption: "This is a caption" }]
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
        media: [{url: "resources/imgs/pt/"+randomInteger(1, 9).toString()+".jpg", type: "jpg", caption: "This is a caption" }]
    });
});

app.addBot(fotoBot);


var reverse_bot = new Bot(
    {
        name: "reverse_bot", 
        entrypoint: 'reverse', 
        keyword: "@reverse", 
        inline: true,
        description: 'Retornar texto invertido'
    }
)

reverse_bot.addProcessor('reverse', function(request){
    const text = request.command.split("").reverse().join("");

    return new Menu({
        title: '🏞️ Fotos aleatorias ⭐📷',
        text: request.lang === 'pt'? "Reverso: " + text : "Reverse: " + text, 
    });
});

app.addBot(reverse_bot);

console.log(app.process({msisdn: "123", command: "@bot"}));
console.log(app.process({msisdn: "123", command: "1"}));
console.log(app.process({msisdn: "123", command: "6"}));

console.log(app.process({msisdn: "123", command: "!help"}));
console.log(app.process({msisdn: "123", command: "ola"}));

console.log(app.process({msisdn: "123", command: "@photos"}));
console.log(app.process({msisdn: "123", command: "@fotos"}));
console.log(app.process({msisdn: "123", command: "!ajuda"}));

console.log(app.process({msisdn: "123", command: "@reverse ben chambule", lang: 'pt'}));
console.log(app.process({msisdn: "123", command: "@reverse elubmahc neb", lang: 'en'}));

console.log(app.process({msisdn: "123", command: "@bot"}));
console.log(app.process({msisdn: "123", command: "1"}));
console.log(app.process({msisdn: "123", command: "6"}));
console.log(app.process({msisdn: "123", command: "0"}));
console.log(app.process({msisdn: "123", command: "@sair"}));