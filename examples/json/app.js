const {createAppFromFile} = require('../../helpers.js');
const {InMemorySessionManager} = require('../../index.js');

var app = createAppFromFile("./examples/json/app.json", new InMemorySessionManager());

app.getBot("main_bot").at('language', function(){
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

console.log("---------------------------------------------------------------");
console.log({msisdn:"1223", prompt: "@nome"}, app.process({msisdn:"1223", prompt: "@nome"}));

console.log("---------------------------------------------------------------");
console.log({msisdn:"1223", prompt: "@bot"}, app.process({msisdn:"1223", prompt: "@bot"}));
console.log({msisdn:"1223", prompt: "1"}, app.process({msisdn:"1223", prompt: "1"}));
console.log({msisdn:"1223", prompt: "4"}, app.process({msisdn:"1223", prompt: "4"}));

console.log("---------------------------------------------------------------");
console.log({msisdn:"1223", prompt: "@grau"}, app.process({msisdn:"1223", prompt: "@grau"}));

console.log("---------------------------------------------------------------");
console.log({msisdn:"1223", prompt: "@bot"}, app.process({msisdn:"1223", prompt: "@bot"}));
console.log({msisdn:"1223", prompt: "1"}, app.process({msisdn:"1223", prompt: "1"}));

console.log("---------------------------------------------------------------");
console.log({msisdn:"1223", prompt: "@grau"}, app.process({msisdn:"1223", prompt: "@grau"}));
console.log({msisdn:"1223", prompt: "4"}, app.process({msisdn:"1223", prompt: "4"}));
console.log({msisdn:"1223", prompt: "0"}, app.process({msisdn:"1223", prompt: "0"}));