'use strict';

class InMemorySessionManager {
    constructor(){
        this.sessions = [];
    }

    getSession(msisdn){
        var session = null;
        this.sessions.forEach(element => {
            if (element !== null && element.msisdn === msisdn){
                session = element;
            }
        });

        return session;
    }

    saveSession(session){
        this.sessions.push(session);
    }

    endSession(session){
        const testing = (e) => e.msisdn === session.msisdn;

        const index = this.sessions.findIndex(testing);

        if(index > -1){
            this.sessions.splice(index, 1);
        }
    }

    updateSession(session){
        var ses = []
        
        for(var i = 0; i < this.sessions.length; i++){
            if(this.sessions[i] !== null && this.sessions[i].id !== session.id) {
                ses.push(session);
            }
        }

        var n_session = session;

        ses.push(n_session);

        this.sessions = ses;
    }
}

module.exports = InMemorySessionManager;
