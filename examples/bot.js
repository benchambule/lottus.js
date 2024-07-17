const {Bot} = require('../index');

let info = new Bot(
    {
        name: "info-bot", 
        entrypoint: 'main', 
        keyword: "@info", 
        description: "Reverses a provided string"
    }
);

info.at('main', () => {
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

info.at('profession', () => {
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

info.at('name', () => {
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

info.at('age', () => {
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

info.at('country', () => {
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

info.intercept('*', function(request, tags, ctxt){
    if(request.prompt.trim() === '@exit'){
        return {
            menu: {
                title: "Thank you for using Ben's bot",
            }
        }
    }
});

let session = info.process({msisdn: "123", prompt: "@info"});
console.log(session);

session = info.process({msisdn: "123", prompt: "1"}, session);
console.log(session);

session = info.process({msisdn: "123", prompt: "0"}, session);
console.log(session);

session = info.process({msisdn: "123", prompt: "2"}, session);
console.log(session);

session = info.process({msisdn: "123", prompt: "@exit"}, session);
console.log(session);


// console.log("---------------------------------------------------------------");
// console.log({msisdn: "123", prompt: "@info"}, info.process({msisdn: "123", prompt: "@info"}));
// console.log({msisdn: "123", prompt: "1"}, info.process({msisdn: "123", prompt: "1"}));
// console.log({msisdn: "123", prompt: "0"}, info.process({msisdn: "123", prompt: "0"}));
// console.log({msisdn: "123", prompt: "2"}, info.process({msisdn: "123", prompt: "2"}));
// console.log({msisdn: "123", prompt: "@exit"}, info.process({msisdn: "123", prompt: "@exit"}));