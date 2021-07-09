class MusicPlayer {
    _songs = [];
    _volume = 0.1;
    _playing = false;
    _nowPlaying = {};
    _repeat = 'off';
    _currentSongIndex = 0;

    //#region 
    get currentSongIndex() {
        return this._currentSongIndex;
    }

    set currentSongIndex(value) {
        this._currentSongIndex = value;
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

    ChangeVolume(connection, volume) {
        if(connection) {
            connection.dispatcher.setVolumeLogarithmic(volume);
        }
    
        this._volume = volume;
    }

    UpdatePlaying(song = null) {
        if(song != null) {
            this._playing = true;
            this._nowPlaying = song;
        } else {
            this._playing = false;
            this._nowPlaying = {};
        }

    }
}

module.exports = MusicPlayer;