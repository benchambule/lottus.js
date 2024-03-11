const {createAppFromFile} = require('../../helpers.js');
const {InMemorySessionManager} = require('../../index.js');

var app = createAppFromFile("./examples/json/app.json", new InMemorySessionManager());

app.getBot("main_bot").addLocationProcessor('language', function(){
    return {
        menu: {
            "name": "language",
            "title": "English | Portugues",
            "options": [
                {"key":"1", "label":"English", "menu":"english"},
                {"key":"2", "label":"Portugues", "menu":"portugues"}
            ]
        }
    }
});

console.log(app.process({msisdn:"1223", prompt: "@nome"}));

console.log(app.process({msisdn:"1223", prompt: "@bot"}));
console.log(app.process({msisdn:"1223", prompt: "1"}));
console.log(app.process({msisdn:"1223", prompt: "4"}));