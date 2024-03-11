class Required {

    constructor(name, regex, error_message){
        this.name = name;
        this.regex = regex;
        this.error_message = error_message;

        if(this.regex == null){
            this.regex = /^.*$/;
        }
    }
}

module.exports = Required;