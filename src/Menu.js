class Menu {
    constructor(name, title, message, next_menu = null){
        this.name = name;
        this.title = title;
        this.message = message;
        this.media = null;
        this.final = false;
        this.options = [];
        this.required = null;
        this.next_menu = next_menu;
    }
}

module.exports = Menu;