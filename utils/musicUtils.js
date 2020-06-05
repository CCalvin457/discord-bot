const ytdl = require('ytdl-core');

async function JoinChannel(message) {
    const voiceChannel = message.member.voice.channel;

    if(!voiceChannel) {
        return message.reply('You need to be in a voice channel first!');
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.reply('I need the permissions to join and speak in your voice channel!');
    }

    const connection = await voiceChannel.join();

    return connection;
}

function CreateQueue(queue, message, voiceChannel = null, connection = null) {
    const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: connection,
        songs: [],
        volume: 0.5,
        playing: false,
        nowPlaying: {}
    }

    queue.set(message.guild.id, queueConstruct);
}

function UpdateQueue(queue, message, voiceChannel, connection) {
    const serverQueue = queue.get(message.guild.id);

    serverQueue.textChannel = message.channel;
    serverQueue.voiceChannel = voiceChannel;
    serverQueue.connection = connection;

    queue.set(message.guild.id, serverQueue);
}


function Play(queue, guild, song) {
    const serverQueue = queue.get(guild.id);

    if(!song) {
        UpdatePlaying(queue, guild, false);
        UpdateNowPlaying(queue, guild)
        return;
    }

    console.log(song);

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url, {filter: "audioonly"}))
        .on('finish', () => {
            serverQueue.songs.shift();
            Play(queue, guild, serverQueue.songs[0]);
        })
        .on('error', error => {
            console.error(error);
        });
    
    dispatcher.setVolumeLogarithmic(serverQueue.volume);
    serverQueue.textChannel.send(`Now Playing: ***${song.title}***`);
    UpdatePlaying(queue, guild, true);
    UpdateNowPlaying(queue, guild, song);
}

function SetVolume(queue, message, value) {
    const serverQueue = queue.get(message.guild.id);

    if(serverQueue.connection) {
        serverQueue.connection.dispatcher.setVolumeLogarithmic(value);
    }

    serverQueue.volume = value;

    queue.set(message.guild.id, serverQueue);

    return message.channel.send(`Volume has been set to ${(value * 100)}%`);
}

function ValidateVolume(value) {
    const volume = Number(value);

    let returnValue = {
        success: false,
        value: NaN,
        message: ''
    }

    console.log(value);

    if(Number.isNaN(volume)) {
        returnValue.message = 'You must enter a valid number to set the volume';
    }else if(volume < 0 || volume > 1) {
        returnValue.message = 'Please enter a value between 0 and 1';
    } else {
        returnValue.success = true;
        returnValue.value = volume;
        returnValue.message = '';
    }

    return returnValue;
}

async function CreateSongInfo(url) {
    var songInfo, song = {};
    try {
        songInfo = await ytdl.getInfo(url);
        song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        }
    } catch(error) {
        console.error(error);
        return;
    }

    return song;
}

function UpdatePlaying(queue, guild, isPlaying) {
    const serverQueue = queue.get(guild.id);

    serverQueue.playing = isPlaying;

    queue.set(guild.id, serverQueue);
}

function UpdateNowPlaying(queue, guild, song = null) {
    const serverQueue = queue.get(guild.id);

    if(song != null) {
        serverQueue.nowPlaying = song;
    } else {
        serverQueue.nowPlaying = {};
    }
}

module.exports = {
    JoinChannel,
    CreateQueue,
    UpdateQueue,
    Play,
    SetVolume,
    ValidateVolume,
    CreateSongInfo
}