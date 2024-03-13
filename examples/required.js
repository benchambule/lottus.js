const {Bot, InMemorySessionManager} = require('../index');

var enq = new Bot(
    {
        name: "enq-bot", 
        entrypoint: 'name', 
        keyword: "@enq", 
        inline: false, 
        description: "This is an enquiry bot",
        sessionManager: new InMemorySessionManager(),
    }
);

enq.addLocationProcessor('name', (request, tags) => {
    const menu = {
        name: 'name',
        title: "Welcome to the enquiry bot",
        message: "Please provide your name",
        required: {
            name: "name",
            error_message: "Invalid name",
            regex: /^.*$/,
        },
        next_menu: "birthday",
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
            error_message: "Invalid birthday",
            regex: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
        },
        next_menu: "sport",
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
            error_message: "Invalid sport",
            regex: /^[a-zA-Z]+$/,
            in: {
                options: ["Football", "Basketball", "Racing"],
                ignore_case: false,
            }
        },
        next_menu: "show_info",
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

console.log(enq.process({'msisdn': '123', "prompt": "@enq"}));
console.log(enq.process({'msisdn': '123', "prompt": "Ben Chambule"}));
console.log(enq.process({'msisdn': '123', "prompt": "23/04/1994"}));
console.log(enq.process({'msisdn': '123', "prompt": "no-sport"}));
console.log(enq.process({'msisdn': '123', "prompt": "Football"}));
