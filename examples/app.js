const {Bot, App, InMemorySessionManager} = require('../index');

var sessionManager = new InMemorySessionManager();

const createReverseBot = () => {
    var reverse = new Bot(
        {
            name: "reverse", 
            entrypoint: 'main', 
            keyword: "@reverse", 
            inline: true, 
            description: "Reverses a provided string" 
        }
    );
    
    reverse.addLocationInterceptor('main', (request) => {
        if(request.lang != 'pt'  && request.lang != 'en'){
            const menu = {
                title: 'lang cannot be ' +  "'" + request.lang+ "'" + ". lang should be 'en' or 'pt'",
                final: true
            }
            return {
                menu: menu
            };
        }
    });
    
    reverse.addLocationProcessor('main', function(request, context){
        const txt = request.lang == 'pt'? 'Frase invertida' : 'Reversed sentence';
        const prompt = request.prompt.replace(context.bot.keyword, "").trim();
        const menu = {
            title: txt,
            text: prompt.split("").reverse().join(""), 
            final: true
        }
    
        return {
            menu: menu
        };
    });

    return reverse;
}

const createRequireBot = () => {
    var enq = new Bot(
        {
            name: "enq-bot", 
            entrypoint: 'name', 
            keyword: "@enq", 
            inline: false, 
            description: "This is an enquiry bot",
            sessionManager: sessionManager
        }
    );
    
    enq.addLocationProcessor('name', (request, tags) => {
        const menu = {
            name: 'name',
            title: "Welcome to the enquiry bot",
            message: "Please provide your name",
            required: {
                name: "name",
                error: "Invalid name",
                regex: /^.*$/,
            },
            next: "birthday",
        }
    
        return {
            menu: menu
        };
    });
    
    enq.addLocationProcessor('birthday', (request, tags) => {
        const menu = {
            name: 'birthday',
            title: "Welcome to the enquiry bot",
            message: "Please provide your birthday",
            required: {
                name: "birthday",
                error: "Invalid birthday",
                regex: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
            },
            next: "sport",
        }
    
        return {
            menu: menu
        };
    });
    
    enq.addLocationProcessor('sport', (request, tags) => {
        tags['birthday'] = tags['birthday'].replace(/\//g, '-');
    
        const menu = {
            name: 'sport',
            title: "Welcome to the enquiry bot",
            message: "Please provide your favourite sport",
            required: {
                name: "sport",
                error: "Invalid sport",
                regex: /^[a-zA-Z]+$/,
            },
            next: "show_info",
        };
    
        return {
            menu: menu
        };
    });
    
    enq.addLocationProcessor('show_info', (request, tags) => {
        const txt = "Name: {{name}}\nBirthday: {{birthday}}\nFavourite sport: {{sport}}";
        const menu = {
            name: 'show_info',
            title: "Welcome to the enquiry bot",
            message: txt,
            final: true,
        }
        return {
            menu: menu
        };
    });

    return enq;
}

const createMediaBot = () => {
    var media = new Bot(
        {
            name: "media-bot", 
            entrypoint: 'main', 
            keyword: "@media", 
            inline: true, 
            description: "Reverses a provided string",
        }
    );
    
    function randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    media.addLocationProcessor('main', () => {
        const menu = {
            name: 'main',
            title: "Welcome to Ben's bot",
            message: "Select an option",
            media: [
                {
                    url: "resources/imgs/pt/"+randomInteger(1, 9).toString()+".jpg", 
                    type: "jpg", 
                    caption: "This is a caption" 
                }
            ]
        }
        return {
            menu: menu
        };
    });

    return media;
}

const createOptionsBot = () => {
    var info = new Bot(
        {
            name: "info-bot", 
            entrypoint: 'main', 
            keyword: "@info", 
            inline: false, 
            description: "Reverses a provided string",
            sessionManager: sessionManager,
        }
    );
    
    info.addLocationProcessor('main', () => {
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
    
    info.addLocationProcessor('profession', () => {
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
    
    info.addLocationProcessor('name', (request, context) => {
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
    
    info.addLocationProcessor('age', () => {
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
    
    info.addLocationProcessor('country', () => {
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
    
    info.addLocationInterceptor('*', function(request, tags, ctxt){
        const session = ctxt.bot.sessionManager.get(request.msisdn);
        if(request.prompt.trim() === '@exit'){
            console.log(ctxt.bot.sessionManager.get(session), 'closing!');
            ctxt.bot.sessionManager.close(session);
            console.log(ctxt.bot.sessionManager.get(session), 'closed!');
            return {
                menu: {
                    name: "@exit",
                    title: "Thank you for using Ben's bot",
                }
            }
        }
    });

    return info;
}

const createInquiryBot = () => {
    var bot = new Bot({
            name: 'enquiry-bot',
            entrypoint: 'main',
            keyword: '@enq',
            inline: false,
            sessionManager : sessionManager
        }
    );

    bot.addLocationProcessor('main', function(req, tags, ctx){
        const menu = {
            name: 'main',
            title: "Welcome to Ben's bot",
            message: "Please provide your name",
            next: 'age'
        }

        return {
            menu: menu,
            tags: tags
        }
    });

    bot.addLocationProcessor('age', function(req, tags, ctx){
        const menu = {
            name: 'age',
            title: "Welcome to Ben's bot",
            message: "Please provide your age",
            next: 'show_info'
        }

        tags['name'] = req.prompt;

        return {
            menu: menu,
            tags: tags
        }
    });

    bot.addLocationProcessor('show_info', function(req, tags, ctxt){
        tags['age'] = req.prompt;
        const menu = {
            name: 'show_info',
            title: "Welcome to Ben's bot",
            message: "Provided information\n" + "Name: {{name}}\nAge: {{age}}",
            final: true
        }

        return {
            menu: menu,
            tags: tags
        }
    });

    return bot;
}

const createInterceptorsBot = () => {
    var bot = new Bot({
        name: 'barber',
        entrypoint: 'main',
        keyword: '@barber',
        inline: false,
        sessionManager: sessionManager
    });
    
    bot.addLocationProcessor('main', function(req, tags, ctxt){
       const menu = {
            name: 'main', 
            title: 'Welcome to Barbershop', 
            text: 'Select an option',
            options: [
                {key: '1', label: 'Information', next: 'info'},
                {key: '2', label: 'Location', next: 'location'},
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
                    {key: '0', label: 'Back', next: 'main'}
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
        if(req.prompt == '.exit'){
            return {
                menu: {
                    message: 'Bye',
                    final: true,
                }
            }
        }
    });

    return bot;
}

const rev = createReverseBot();
const req = createRequireBot();
const med = createMediaBot();
const opt = createOptionsBot();
const enq = createInquiryBot();
const int = createInterceptorsBot();

const app = new App(sessionManager, ["!help"]);
app.addBot(rev);
app.addBot(req);
app.addBot(med);
app.addBot(opt);
app.addBot(enq);
app.addBot(int);

console.log(app.process({msisdn: '123', prompt: '!help'}));
console.log(app.process({msisdn: '123', prompt: '@media'}));
console.log(app.process({msisdn: '123', prompt: '@enq'}));
console.log(app.process({msisdn: '123', prompt: 'Ben Chambule'}));
console.log(app.process({msisdn: '123', prompt: '30'}));

console.log(app.process({msisdn: '123', prompt: '@enq'}));
console.log(app.process({msisdn: '123', prompt: 'Ben Chambule'}));
console.log(app.process({msisdn: '123', prompt: '@reverse hello world', lang:'en'}));
console.log(app.process({msisdn: '123', prompt: '30'}));

console.log(app.process({msisdn: '123', prompt: '@enq'}));
console.log(app.process({msisdn: '123', prompt: 'Ben Chambule'}));
console.log(app.process({msisdn: '123', prompt: '@info'}));
console.log(app.process({msisdn: '123', prompt: '1'}));

console.log(app.process({msisdn: '123', prompt: '@enq'}));
console.log(app.process({msisdn: '123', prompt: 'Ben Chambule'}));
console.log(app.process({msisdn: '123', prompt: '@info'}));
console.log(app.process({msisdn: '123', prompt: '@reverse hello world', lang:'en'}));
console.log(app.process({msisdn: '123', prompt: '1'}));