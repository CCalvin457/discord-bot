const MusicPlayer = require('./musicPlayer');

class Server {
    _musicPlayer = new MusicPlayer();

    constructor(message, voiceChannel = null, connection = null) {
        this._textChannel = message.channel;
        this._voiceChannel = voiceChannel;
        this._connection = connection;
    }

    //#region Getters and Setters
    get musicPlayer() {
        return this._musicPlayer;
    }

    get textChannel() {
        return this._textChannel;
    }

    get voiceChannel() {
        return this._voiceChannel;
    }

    get connection() {
        return this._connection;
    }
    //#endregion

    UpdateServerConnectionInfo(serverList, message, voiceChannel, connection) {
        this._textChannel = message.channel;
        this._voiceChannel = voiceChannel;
        this._connection = connection;

        serverList.set(message.guild.id, this);
    }

    ClearServerConnectionInfo(serverList, id) {
        this._connection = null;
        this._voiceChannel = null;
        this._playing = false;
        this._nowPlaying = {};

        serverList.set(id, this);
    }
}

module.exports = Server;