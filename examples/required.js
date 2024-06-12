const {Bot} = require('../index');

var enq = new Bot(
    {
        name: "enq-bot", 
        entrypoint: 'name', 
        keyword: "@enq", 
        inline: false, 
        description: "This is an enquiry bot",
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
var session = enq.process({'msisdn': '123', "prompt": "@enq"});
console.log({'msisdn': '123', "prompt": "@enq"}, session);

session = enq.process({'msisdn': '123', "prompt": "Ben Chambule"}, session);
console.log({'msisdn': '123', "prompt": "Ben Chambule"}, session);

session = enq.process({'msisdn': '123', "prompt": "23/04"}, session);
console.log({'msisdn': '123', "prompt": "23/04"}, session); // Will fail

session = enq.process({'msisdn': '123', "prompt": "23/04/1994"}, session);
console.log({'msisdn': '123', "prompt": "23/04/1994"}, session);

session = enq.process({'msisdn': '123', "prompt": "no-sport"}, session);
console.log({'msisdn': '123', "prompt": "no-sport"}, session); // Will fail

session = enq.process({'msisdn': '123', "prompt": "Football"}, session);
console.log({'msisdn': '123', "prompt": "Football"}, session);
