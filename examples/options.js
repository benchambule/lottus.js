const {Bot, InMemorySessionManager} = require('../index');

var info = new Bot(
    {
        name: "info-bot", 
        entrypoint: 'main', 
        keyword: "@info", 
        inline: false, 
        description: "Reverses a provided string",
        sessionManager: new InMemorySessionManager(),
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
    console.log('interceptor')
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

console.log(info.process({msisdn: "123", prompt: "@info"}));
console.log(info.process({msisdn: "123", prompt: "@exit"}));