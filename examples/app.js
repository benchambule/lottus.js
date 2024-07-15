(async function () {
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
        
        reverse.intercept('main', async (request) => {
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
        
        reverse.at('main', async function(request, context){
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

    const createRequireBot = async () => {
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
        
        enq.at('name', async () => {
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
        
        enq.at('birthday', async () => {
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
        
        enq.at('sport', async (request, tags) => {
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
        
        enq.at('show_info', async () => {
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

    const createMediaBot = async () => {
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
        
        media.at('main', async () => {
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

    const createOptionsBot = async () => {
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

    const createInquiryBot = async () => {
        var bot = new Bot({
                name: 'enquiry-bot',
                entrypoint: 'main',
                keyword: '@enq',
                inline: false,
                sessionManager : sessionManager
            }
        );

        bot.at('main', async function(req, tags){
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

        bot.at('age', async function(req, tags){
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

        bot.at('show_info', async function(req, tags){
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
        
        bot.at('main', async function(){
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
        
        bot.at('location', async function(){
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
        
        bot.intercept('info', async function(req){
            if(req.prompt == 'hello'){
                return {
                    message: 'Hi there',
                    final: true
                };
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
    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '!help'}, await app.process({msisdn: '123', prompt: '!help'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '@media'}, await app.process({msisdn: '123', prompt: '@media'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '@enq'}, await app.process({msisdn: '123', prompt: '@enq'}));
    console.log({msisdn: '123', prompt: 'Ben Chambule'}, await app.process({msisdn: '123', prompt: 'Ben Chambule'}));
    console.log({msisdn: '123', prompt: '30'}, await app.process({msisdn: '123', prompt: '30'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '@enq'}, await app.process({msisdn: '123', prompt: '@enq'}));
    console.log({msisdn: '123', prompt: 'Ben Chambule'}, await app.process({msisdn: '123', prompt: 'Ben Chambule'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '@reverse hello world', lang:'en'}, await app.process({msisdn: '123', prompt: '@reverse hello world', lang:'en'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '30'}, await app.process({msisdn: '123', prompt: '30'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '@enq'}, await app.process({msisdn: '123', prompt: '@enq'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: 'Ben Chambule'}, await app.process({msisdn: '123', prompt: 'Ben Chambule'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '@info'}, await app.process({msisdn: '123', prompt: '@info'}));
    console.log({msisdn: '123', prompt: '1'}, await app.process({msisdn: '123', prompt: '1'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '@enq'}, app.process({msisdn: '123', prompt: '@enq'}));
    console.log({msisdn: '123', prompt: 'Ben Chambule'}, await app.process({msisdn: '123', prompt: 'Ben Chambule'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '@info'}, await app.process({msisdn: '123', prompt: '@info'}));

    console.log("---------------------------------------------------------------");
    console.log({msisdn: '123', prompt: '@reverse hello world', lang:'en'}, await app.process({msisdn: '123', prompt: '@reverse hello world', lang:'en'}));
    console.log({msisdn: '123', prompt: '1'}, await app.process({msisdn: '123', prompt: '1'}));
})();