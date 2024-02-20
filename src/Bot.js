'use strict';

const Session  = require('./Session')
const Menu = require('./Menu')

/**
 * Bot's internal storage of the menus
 * @param {Menu[]} - the list of the menus
 */
class MenuStorage {
    #menus = [];

    constructor(menus = []){
        if(menus){
            menus.forEach(msg => {
                this.#menus[msg.name] = msg
            });
        }
    }

    /**
     * Returns a menu by it's name
     * @param {string} name 
     * @returns {Menu}
     */
    getMenu(name){
        const menu = this.#menus[name];

        if(!menu){
            return null;
        }
        return JSON.parse(JSON.stringify(menu));
    }

    /**
     * Adds a menu to the menu storage
     * @param {Menu} menu - the menu to be added
     */
    addMenu(menu){
        this.#menus[menu.name] = menu;
    }

    /**
     * Deletes the menu
     * @param {string} name  - the name of the menu to be deleted
     */
    deleteMenu(name){
        delete this.#menus[name];
    }

    /**
     * Updates the menu
     * @param {string} name of the menu to be updated 
     * @param {Menu} menu new menu details
     */
    updateMenu(name, menu){
        this.#menus[name] = menu;
    }
}

/**
 * Bot definition
 * @param {string} name - the name of the bot
 * @param {string} entrypoint - the entrypoint of the bot. This can be a menu name or a processor name.
 * @param {string} keyword - the keyword to start the bot.
 * @param {boolean} inline - whether the bot is inline or not. Inline bots do not require context and just display information.
 * @param {SessionManager} sessionManager - the session storage to be used. Not required if bot is inline.
 * @param {string} description - the description of the bot.
 * @param {string} exitword - a word that kills the bot. Not required if bot is inline.
 * @param {string} exitpoint - a menu name that represents the goodbye message. Not required if bot is inline.
 */

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
        this.sessionManager = data.sessionManager;
        this.description = data.description;
        this.exitword = data.exitword;
        this.exitpoint = data.exitpoint;
        this.#_menu_storage = new MenuStorage(data.menus);

        if(!this.inline) {
            this.invali_option_message = data.invali_option_message;

            if(!this.invali_option_message){
                this.invali_option_message = '❌ Invalid option. Please try again 🙃';
            }

            if(!data.exitpoint){
                this.exitpoint = 'exit';
            }

            if(!data.exitword){
                this.exitword = '@exit';
            }
        }
    }

    /**
     * Set's the session storage
     * @param {SessionManager} - the object that will be used to store the sessions.
     */
    setSessionManager(sessionManager){
        this.sessionManager = sessionManager;
    }

    /**
     * Adds a processor to the list of processors.
     * @param {string} name - the name of the processor. 
     * @param {function} processor - a function that returns a {Menu} object.
     * 
     * The function params can be:
     * @param {Request} request - the request object.
     * @param {Map<string, string>} tags - the tags object.
     * @returns {Menu} - the menu object. Or object with {tags: Map<string, string>, menu: Menu}.
     * @example
     * addProcessor('processor_name', (request) => {
     * console.log(request.command);
     *      return new Menu({name: 'hello', text:'hello world});
     * });
     * 
     * @example
     * Note that we can receive tags or return tags. Tags will be saved to the session for later access.
     * addProcessor('processor_name', (request, tags) => {
     *      return {tags: [{'key':'value'}], menu: new Menu({name: 'hello', text:'hello world})};
     * });
     */
    addProcessor(name, processor){
        this.#_processors[name] = processor;
    }


    /**
     * Update processor details
     * @param {string} name - name of the processor
     * @param {function} processor - a processor function
     */
    updateProcessor(name, processor){
        this.#_processors[name] = processor;
    }


    /**
     * Adds a menu to the menu list
     * @param {Menu} menu - the menu object.
     */
    addMenu(menu){
        this.#_menu_storage.addMenu(menu);
    }

    /**
     * Returns a menu object by name
     * @param {string} name - menu name
     * @returns 
     */
    getMenu(name){
        return this.#_menu_storage.getMenu(name);
    }

    /**
     * Deletes a menu by name
     * @param {string} name  - menu name
     */
    deleteMenu(name){
        this.#_menu_storage.deleteMenu(name);
    }

    /**
     * Update the menu details
     * @param {string} name  - menu name
     * @param {Menu} menu - menu object
     */
    updateMenu(name, menu){
        this.#_menu_storage.updateMenu(name, menu);
    }


    _process_inline_request(request){
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
    }

    _return_entrypoint_menu(request){
        var new_menu = null;

        if(session){
            this.sessionManager.endSession(request.msisdn);
        }
        
        var location = this.entrypoint;

        var processor = this.getProcessor(location);
        if(processor){
            new_menu = processor(request);
        }else{
            new_menu = this.getMenu(location);
        }

        var session = new Session({
            key: request.session ? request.session : Math.floor(Math.random() * 1000000) + 1,
            msisdn: request.msisdn,
            location: location,
            current_menu: new_menu,
            bot: this.name
        }
        );

        return {menu: new_menu, session: session};
    }

    _process_options_menu(request, menu, session){
        var selected_option = null;
        var new_menu = null;

        menu['options'].forEach(element => {
            if(element.key === request.command) {
                selected_option = element;
            }
        });

        if(!selected_option){
            new_menu = menu;
            new_menu['text'] = menu.invali_option_message?menu.invali_option_message:this.invali_option_message; 
        }else{
            const processor = this.getProcessor(selected_option['menu']);

            if(processor){
                request.command = request.command.replace(this.keyword, '').trim();
                const result = processor(request, session.tags);
            
                return result;
            }else {
                new_menu = this.getMenu(selected_option['menu']);

                return new_menu;
            }
        }

        return null;
    }

    /**
     * Figures out the best strategy to process a request.
     * If the bot is inline, it will process the request without creating a session.
     * @param {object} request - the request details. The minimum request object has the following definition {msisdn: 'msisdn', command: 'command'}.
     * @returns {Menu} - the menu object, or null if no Menu was generated.
     */
    process(request){
        if(this.inline){
            return this._process_inline_request(request);
        }else{
            var session = this.sessionManager.getSession(request.msisdn);
            var new_menu = null;

            if(request.command === this.keyword || !session){
                const result = this._return_entrypoint_menu(request);
                
                new_menu = result.menu;
                session = result.session;

                this.sessionManager.saveSession(session);
            } else {
                if(request.command === this.exitword && session){
                    new_menu = this.getMenu(this.exitpoint);

                    if(!new_menu){
                        new_menu = new Menu({
                            name: this.exitpoint,
                            title: 'Goodbye'
                        })
                    }

                    this.sessionManager.endSession(session)

                    return new_menu;
                }

                var current_menu = session.current_menu;

                if(current_menu['options']){
                    const result = this._process_options_menu(request, current_menu, session);

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
                }

                if(current_menu['required'] && !new_menu){
                    const required = current_menu['required'];

                    if(!request.command.match(required['regex'])){
                        new_menu = current_menu
                        new_menu['text'] = required['error'];
                    }else{
                        session.tags.push({"name": required["name"], 'value': request.command});
                        new_menu = this.getMenu(required['next_menu']);
                    }
                }

                if(new_menu){
                    session.tags.forEach(element => {
                        new_menu['text'] = new_menu.text.replace("{{" + element['name'] + "}}", element['value']);
                        new_menu['title'] = new_menu.text.replace("{{" + element['name'] + "}}", element['value']);
                    })

                    session.current_menu = new_menu;
                    session.location = new_menu['name'];

                    this.sessionManager.updateSession(session);
        
                    if(new_menu.final){
                        this.sessionManager.endSession(session);
                    }
                } else {
                    console.log('new menu is null')
                }
            }

            return new_menu
        }
    }

    /**
     * Returns a processor by name
     * @param {string} name - the processor name
     * @returns 
     */
    getProcessor(name){
        if(this.#_processors){
            return this.#_processors[name];
        }else{
            return null
        }
    }
}

module.exports = Bot;