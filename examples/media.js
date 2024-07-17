const {Bot} = require('../index');

let media = new Bot(
    {
        name: "media-bot", 
        entrypoint: 'main', 
        keyword: "@media", 
        description: "Reverses a provided string",
    }
);

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

media.at('main', () => {
    const menu = {
        name: 'main',
        title: "Welcome to Ben's bot",
        message: "Select an option",
        final: true,
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

console.log("---------------------------------------------------------------");
let session = media.process({msisdn: "123", prompt: "@media"});