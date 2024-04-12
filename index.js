'use strict';

module.exports = {
    Bot: require('./src/Bot'),
    App: require('./src/App'),
    InMemorySessionManager: require('./src/InMemorySessionManager'),
    helpers: require('./helpers'),

    version: require('./package.json'),
}