const {Bot} = require('../index');

let info = new Bot(
    {
        name: "info-bot", 
        entrypoint: 'main', 
        keyword: "@info", 
        description: "Reverses a provided string"
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

info.intercept('*', async (request) => {
    if(request.prompt.trim() === '@exit'){
        return {
            menu: {
                title: "Thank you for using Ben's bot",
            }
        }
    }
});
(async () => {
    let session = await info.process({msisdn: "123", prompt: "@info"});
    console.log(session);

    session = await info.process({msisdn: "123", prompt: "1"}, session);
    console.log(session);

    session = await info.process({msisdn: "123", prompt: "0"}, session);
    console.log(session);

    session = await info.process({msisdn: "123", prompt: "2"}, session);
    console.log(session);

    session = await info.process({msisdn: "123", prompt: "@exit"}, session);
    console.log(session);
})();