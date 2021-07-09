const MusicPlayer = require('./musicPlayer');

class Server {
    _musicPlayer = new MusicPlayer();

    constructor(message, connection = null) {
        this._textChannel = message.channel;
        this._connection = connection;
    }

    //#region Getters and Setters
    get musicPlayer() {
        return this._musicPlayer;
    }

    get textChannel() {
        return this._textChannel;
    }

    get connection() {
        return this._connection;
    }
    //#endregion

    UpdateServerConnectionInfo(message, connection) {
        this._textChannel = message.channel;
        this._connection = connection;
    }

    ClearServerConnectionInfo() {
        this._connection = null;
        this._playing = false;
        this._nowPlaying = {};
    }
}

module.exports = Server;