const {Bot, InMemorySessionManager} = require('../index');

var enq = new Bot(
    {
        name: "enq-bot", 
        entrypoint: 'name', 
        keyword: "@enq", 
        inline: false, 
        description: "This is an enquiry bot",
        sessionManager: new InMemorySessionManager(),
        debug: false
    }
);

enq.at('name', () => {
    const menu = {
        name: 'name',
        title: "Welcome to the enquiry bot",
        message: "Please provide your name",
        required: {
            name: "name",
            error_message: "Invalid name",
            regex: /^.*$/,
        },
        next: "birthday",
    }

    return {
        menu: menu
    };
});

enq.at('birthday', () => {
    const menu = {
        name: 'birthday',
        title: "Welcome to the enquiry bot",
        message: "Please provide your birthday",
        required: {
            name: "birthday",
            error_message: "Invalid birthday",
            regex: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
        },
        next: "sport",
    }

    return {
        menu: menu
    };
});

enq.at('sport', (request, tags) => {
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
        next: "show_info",
    };

    return {
        menu: menu
    };
});

enq.at('show_info', () => {
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

console.log("---------------------------------------------------------------");
console.log({'msisdn': '123', "prompt": "@enq"}, enq.process({'msisdn': '123', "prompt": "@enq"}));
console.log({'msisdn': '123', "prompt": "Ben Chambule"}, enq.process({'msisdn': '123', "prompt": "Ben Chambule"}));
console.log({'msisdn': '123', "prompt": "23/04/1994"}, enq.process({'msisdn': '123', "prompt": "23/04"})); // Will fail
console.log({'msisdn': '123', "prompt": "23/04/1994"}, enq.process({'msisdn': '123', "prompt": "23/04/1994"}));
console.log({'msisdn': '123', "prompt": "no-sport"}, enq.process({'msisdn': '123', "prompt": "no-sport"})); // Will fail
console.log({'msisdn': '123', "prompt": "Football"}, enq.process({'msisdn': '123', "prompt": "Football"}));
