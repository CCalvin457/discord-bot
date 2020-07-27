class Server {
    _songs = [];
    _volume = 0.1;
    _playing = false;
    _nowPlaying = {};
    _repeat = 'off';

    constructor(message, voiceChannel = null, connection = null) {
        this._textChannel = message.channel;
        this._voiceChannel = voiceChannel;
        this._connection = connection;
    }

    //#region Getters and Setters
    get textChannel() {
        return this._textChannel;
    }

    get voiceChannel() {
        return this._voiceChannel;
    }

    get connection() {
        return this._connection;
    }

    get songs() {
        return this._songs;
    }

    set songs(values) {
        this._songs.push(values);
    }

    get volume() {
        return this._volume;
    }

    set volume(value) {
        if(this._connection) {
            this._connection.dispatcher.setVolumeLogarithmic(value);
        }

        this._volume = value;
    }

    get playing() {
        return this._playing;
    }

    set playing(value) {
        this._playing = value;
    }

    get nowPlaying() {
        return this._nowPlaying;
    }

    set nowPlaying(value) {
        this._nowPlaying = value;
    }

    get repeat() {
        return this._repeat;
    }

    set repeat(value) {
        this._repeat = value;
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

    UpdatePlaying(id, serverList, song = null) {
        if(song != null) {
            this._playing = true;
            this._nowPlaying = song;
        } else {
            this._playing = false;
            this._nowPlaying = {};
        }
    
        serverList.set(id, this);
    }
}

module.exports = Server;