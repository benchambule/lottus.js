'use strict';

const Database = require('better-sqlite3');

class SQLiteSessionManager {
    
    constructor(file) {
        this.db = new Database(file);
        
        // This is optional to improve performance
        this.db.pragma('journal_mode = WAL');
        
        this.db.prepare('CREATE TABLE IF NOT EXISTS sessions (msisdn TEXT, prompt TEXT, menu TEXT, session TEXT)').run();
    }

    createNew(session) {
        this.db.prepare('INSERT INTO sessions VALUES (?, ?, ?, ?)').run(session.msisdn, session.prompt, session.menu, JSON.stringify(session));
        return session;
    }

    get(msisdn) {
        const row = this.db.prepare('SELECT * FROM sessions WHERE msisdn = ?').get(msisdn);
        return row ? JSON.parse(row.session) : null;
    }

    close(session) {
        this.db.prepare('DELETE FROM sessions WHERE msisdn = ?').run(session.msisdn);
    }

    update(session) {
        this.db.prepare('UPDATE sessions SET session = ? WHERE msisdn = ?').run(JSON.stringify(session), session.msisdn);
    }
    

}

module.exports = SQLiteSessionManager;