'use strict';

/**
 * Represents the media details
 * @param {string} url - url of the media
 * @param {string} type - type of the media
 * @param {string} caption - caption of the media
 */
class Media {
    constructor(data){
        this._initialize(data);
    }

    _initialize(data){
        this.url = data.url;
        this.type = data.type;
        this.caption = data.caption;
    }
}

module.exports = Media;
