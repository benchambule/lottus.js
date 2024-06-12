'use strict';

const fs = require('fs');
const Bot = require('./Bot');

function createBotFromJSON(json){

    const entrypoint = json['entrypoint'];
    const keyword = json['keyword'];
    const name = json['name'];
    const inline = json['inline'];
    const menus = json['menus'];
    const description = json['description'];

    const bot = new Bot(
        {
            name: name,
            entrypoint: entrypoint,
            keyword: keyword,
            inline: inline,
            description: description,
        }
    );

    menus.forEach(menu => {
        bot.at(menu.name, function(req, tags){
            if(menu.required && menu.required.regex){
                menu.required.regex = new RegExp(menu.required.regex);
            }
            
            return {
                menu: menu,
                tags: tags,
            }
        });
    });

    return bot;
}


function createBotFromFile(filename){
    const file_contents = fs.readFileSync(filename, 'utf8');

    const json = JSON.parse(file_contents);

    return createBotFromJSON(json);
}


module.exports = {
    createBotFromFile: createBotFromFile,
    createBotFromJSON: createBotFromJSON,
}
