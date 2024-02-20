# lottus.js
=====================

### Examples
---------------------
``` {.sourceCode .javascript}
'use strict';

const {Bot, Menu} = require('lottus.js');

const app = new Bot(
    {
        name: 'bot',
        entrypoint: 'main',
        keyword: '@echo',
        menus:[
            new Menu({name: 'main', title: 'Hello', text:'-->{{$@}}'})
        ],
        inline: true
    }
);

console.log(app.process({msisdn: "123", command: "@display hello world"}));
```

``` {.sourceCode .javascript}
'use strict';

const {Bot, Menu} = require('lottus.js');

const app = new Bot(
    {
        name: 'bot',
        entrypoint: 'main',
        keyword: '@echo',
        inline: true
    }
);

app.addProcessor('main', function(request){
    return new Menu(
        {
            name: 'main',
            title: 'Hello',
            text: '-->'+request.command
        }
    );
});

console.log(app.process({msisdn: "123", command: "@echo hello world"}));
```

```
{.sourceCode .javascript}
'use strict';

const {Bot, Menu, Option} = require('lottus.js');

function createBarberShopBot() {
    return new Bot({
            name: 'barber',
            entrypoint: 'main',
            keyword: '@barbershop',
            menus: [
                new Menu({
                    name: 'main', 
                    title: 'Welcome to my Barbershop', 
                    text: 'Select an option', 
                    final: false, 
                    options: [
                        new Option('1', 'Informations', 'info'),
                        new Option('2', 'Location', 'location'),
                    ]
                }),

                new Menu({
                    name: 'info', 
                    title: 'Information', 
                    text: 'Barbershop's information', 
                    final: true}
                ),

                new Menu({
                    name: 'location',
                    title: 'Location', 
                    text: 'Barbershop's location', 
                    final: false, 
                    options: [
                        new Option('0', 'Back', 'main')
                    ]
                }),

                new Menu({name: 'exit', title: 'Thank you', text: 'Thanks for visiting us', final: true})
            ],
            inline: false,
            session_storage: session_storage
        }
    );
}

const b_app = createBarberShopBot()

console.log("@barbershop", b_app.process({msisdn: "123", command: "@barbershop"}));
console.log("1", b_app.process({msisdn: "123", command:"1"}));

console.log("@barbershop", b_app.process({msisdn: "123", command: "@barbershop"}));
console.log("2", b_app.process({msisdn: "123", command: "2"}));
console.log("0", b_app.process({msisdn: "123", command: "0"}));
console.log(session_storage);
console.log("@exit", b_app.process({msisdn: "123", command: "@exit"}));
```