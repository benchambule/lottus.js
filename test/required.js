const assert = require('assert');

const {Bot} = require('../index');

const createRequireBot = () => {
    let enq = new Bot(
        {
            name: "enq-bot", 
            entrypoint: 'name', 
            keyword: "@enq", 
            inline: false, 
            description: "This is an enquiry bot",
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

describe('Required', () => {
    it('It should store and retrieve required info as tags', () => {
        (async () => {
            const enq = createRequireBot();
        
            let session = await enq.process({'msisdn': '123', "prompt": "@enq"});
            session = await enq.process({'msisdn': '123', "prompt": "Ben Chambule"}, session);
            session = await enq.process({'msisdn': '123', "prompt": "23/04/1994"}, session);
            session = await enq.process({'msisdn': '123', "prompt": "no-sport"}, session);
            const menu = await enq.process({'msisdn': '123', "prompt": "Football"}, session).menu;

            assert.equal(menu.message, "Name: Ben Chambule\nBirthday: 23-04-1994\nFavourite sport: Football");
        })();
    });
})