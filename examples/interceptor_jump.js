const {Bot} = require("../index");

let enq = new Bot(
    {
        name: "enq-bot", 
        entrypoint: 'name', 
        keyword: "@enq", 
        description: "This is an enquiry bot",
        debug: false
    }
);

enq.at('name', async () => {
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

enq.at('birthday', async () => {
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

const sport_menu = {
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

enq.at('sport', async (request, tags) => {
    tags['birthday'] = tags['birthday'].replace(/\//g, '-');

    return {
        menu: sport_menu
    };
});

enq.intercept('birthday', async (req, tags) => {
    const parts = req.prompt.split(" ");
    console.log(parts, tags);
    let menu = null;

    if(parts.length == 4){
        tags['name'] = parts[0] + parts[1];
        tags['birthday'] = parts[2];
        tags['sport'] = parts[3];

        tags['birthday'] = tags['birthday'].replace(/\//g, '-');

        const txt = "Name: {{name}}\nBirthday: {{birthday}}\nFavourite sport: {{sport}}";
        menu = {
            name: 'show_info',
            title: "Welcome to the enquiry bot",
            message: txt,
            final: true,
        }

        return {
            menu: menu,
            tags: tags
        }
    }

    if(parts.length == 3){
        tags['name'] = parts[0] + parts[1];
        tags['birthday'] = parts[2];

        tags['birthday'] = tags['birthday'].replace(/\//g, '-');
        menu = sport_menu;

        return {
            menu: menu,
            tags: tags
        }
    }
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

(async () => {
    console.log("---------------------------------------------------------------");
    let session = await enq.process({'msisdn': '123', "prompt": "@enq"});
    console.log({'msisdn': '123', "prompt": "@enq"}, session.menu);

    session = await enq.process({'msisdn': '123', "prompt": "Ben Chambule"}, session);
    console.log({'msisdn': '123', "prompt": "Ben Chambule"}, session.menu);

    session = await enq.process({'msisdn': '123', "prompt": "23/04"}, session);
    console.log({'msisdn': '123', "prompt": "23/04"}, session.menu); // Will fail

    session = await enq.process({'msisdn': '123', "prompt": "23/04/1994"}, session);
    console.log({'msisdn': '123', "prompt": "23/04/1994"}, session.menu);

    session = await enq.process({'msisdn': '123', "prompt": "no-sport"}, session);
    console.log({'msisdn': '123', "prompt": "no-sport"}, session.menu); // Will fail

    session = await enq.process({'msisdn': '123', "prompt": "Football"}, session);
    console.log({'msisdn': '123', "prompt": "Football"}, session);



    session = await enq.process({'msisdn': '123', "prompt": "@enq"});
    console.log({'msisdn': '123', "prompt": "@enq"}, session.menu);

    session = await enq.process({'msisdn': '123', "prompt": "Ben Chambule 23/04/1994 Football"}, session);
    console.log({'msisdn': '123', "prompt": "Ben Chambule"}, session.menu);
})();