'use strict';

const Session  = require('./Session')
const Menu = require('./Menu')


class MenuStorage {
    constructor(menus = []){
        this.menus = {}

        if(menus){
            menus.forEach(msg => {
                this.menus[msg.name] = msg
            });
        }
    }

    getMenu(name){
        var menu = this.menus[name];
        if(!menu){
            return null;
        }
        return JSON.parse(JSON.stringify(menu));
    }

    addMenu(name, menu){
        this.menus[name] = menu;
    }

    deleteMenu(name){
        delete this.menus[name];
    }

    updateMenu(name, menu){
        this.menus[name] = menu;
    }
}


class Bot {
    #_menu_storage = null;
    #_processors = {};

    constructor(data){
        if(data){
            this._initialize(data);
        }
    }

    _initialize(data){
        this.name = data.name;
        this.entrypoint = data.entrypoint;
        this.keyword = data.keyword;
        this.inline = data.inline;
        this.session_storage = data.session_storage;
        this.description = data.description;
        this.exitword = data.exitword;
        this.exitpoint = data.exitpoint;
        this.#_menu_storage = new MenuStorage(data.menus);

        if(!data.exitpoint){
            this.exitpoint = 'exit';
        }

        if(!data.exitword){
            this.exitword = '@exit';
        }

        if(!this.#_processors && !data.menus){
            this.inline = true;
        }
    }

    setSessionStorage(session_storage){
        this.session_storage = session_storage;
    }

    addProcessor(name, processor){
        this.#_processors[name] = processor;
    }

    updateProcessor(name, processor){
        this.#_processors[name] = processor;
    }

    addMenu(name, menu){
        this.#_menu_storage.addMenu(name, menu);
    }

    getMenu(name){
        return this.#_menu_storage.getMenu(name);
    }

    deleteMenu(name){
        this.#_menu_storage.deleteMenu(name);
    }

    updateMenu(name, menu){
        this.#_menu_storage.updateMenu(name, menu);
    }

    process(request){
        if(this.inline){
            if(request.command.includes(this.keyword)){
                var menu = this.getMenu(this.entrypoint);

                if(menu){
                    request.command = request.command.replace(this.keyword, "").trim();
                    const reqs = request.command.split(" ");

                    if(reqs.length > 0){
                        if(menu['text'].includes("{{$@}}")){
                            var txt = reqs.join(" ");
                            menu['text'] = menu['text'].replace("{{$@}}", txt);
                        }

                        for(var i = 0; i < reqs.length; i++){
                            menu['text'] = menu['text'].replace("{{$" + i + "}}", reqs[i]);
                        }
                    }
                }else{
                    const processor = this.getProcessor(this.entrypoint);

                    if(processor){
                        request.command = request.command.replace(this.keyword, '').trim();
                        menu = processor(request);
                    }
                }
                if(menu) {
                    menu.final = true;
                }
                return menu;
            }

            return null;
        }else{
            var session = this.session_storage.getSession(request.msisdn);
            var new_menu = null;

            if(request.command === this.keyword || !session){
                if(session){
                    this.session_storage.endSession(request.msisdn);
                }
                
                var location = this.entrypoint;

                var processor = this.getProcessor(location);
                if(processor){
                    new_menu = processor(request);
                }else{
                    new_menu = this.getMenu(location);
                }

                var session = new Session(
                    Math.random(),
                    request.msisdn,
                    location,
                    new_menu,
                    this.name
                );

                this.session_storage.saveSession(session);
            } else {
                if(request.command === this.exitword && session){
                    new_menu = this.getMenu(this.exitpoint);

                    if(!new_menu){
                        new_menu = new Menu({
                            name: this.exitpoint,
                            title: 'Adeus',
                            messsage: 'Agradecemos pelo contacto'
                        })
                    }

                    this.session_storage.endSession(session)

                    return new_menu;
                }

                var current_menu = session.current_menu;

                if(current_menu['options']){
                    var selected_option = null;

                    current_menu['options'].forEach(element => {
                        if(element.key === request.command) {
                            selected_option = element;
                        }
                    });

                    if(!selected_option){
                        new_menu = current_menu;
                        new_menu['text'] = '❌ Escolha inválida 🙃'; 
                    }else{
                        const processor = this.getProcessor(selected_option['menu']);

                        if(processor){
                            request.command = request.command.replace(this.keyword, '').trim();
                            const result = processor(request, session.tags);

                            if(result){
                                if('tags' in result){
                                    result.tags.forEach(element => {
                                        session.tags.push(element);
                                    });
                                }

                                if('menu' in result){
                                    new_menu = result.menu;
                                }

                                if('name' in result){
                                    new_menu = result;
                                }
                            }
                        }else {
                            new_menu = this.getMenu(selected_option['menu']);
                        }
                    }
                }

                if(current_menu['required'] && !new_menu){
                    const required = current_menu['required'];

                    if(!request.command.match(required['regex'])){
                        new_menu = current_menu
                        new_menu['text'] = required['error'];
                    }else{
                        session.tags.push({"name": required["name"], 'value': request.command});
                        new_menu = this.getMenu(required['next']);
                    }
                }

                if(new_menu){
                    session.tags.forEach(element => {
                        new_menu['text'] = new_menu.text.replace("{{" + element['name'] + "}}", element['value']);
                        new_menu['title'] = new_menu.text.replace("{{" + element['name'] + "}}", element['value']);
                    })

                    session.current_menu = new_menu;
                    session.trajectory += new_menu['name'] + "->";
                    session.location = new_menu['name'];

                    this.session_storage.updateSession(session);
        
                    if(new_menu.final){
                        this.session_storage.endSession(session);
                    }
                } else {
                    console.log('new menu is null')
                }
            }

            return new_menu
        }
    }

    getProcessor(name){
        if(this.#_processors){
            return this.#_processors[name];
        }else{
            return null
        }
    }
}

module.exports = Bot;