const ytdl = require('ytdl-core');
const fs = require('fs');
const { Repeat } = require('./repeatEnum.js');
const Discord = require('discord.js');

async function JoinChannel(message) {
    const voiceChannel = message.member.voice.channel;
    var connection;

    try {
        connection = await voiceChannel.join();
    } catch(error) {
        if(!voiceChannel) {
            throw 'You need to be in a voice channel first!';
        }
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            throw 'I need the permissions to join and speak in your voice channel!';
        }
    }

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
        nowPlaying: {},
        repeat: 'off'
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
        UpdatePlaying(queue, guild);
        return;
    }

    console.log(song);

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url, {filter: "audioonly"}))
        .on('finish', () => {
            let currentSong = serverQueue.songs.shift();

            if(serverQueue.repeat == Repeat.On) {
                serverQueue.songs.push(currentSong);
            }
            
            if(serverQueue.repeat == Repeat.One) {
                serverQueue.songs.unshift(currentSong);
            }

            Play(queue, guild, serverQueue.songs[0]);
        })
        .on('error', error => {
            console.error(error);
        });
    
    dispatcher.setVolumeLogarithmic(serverQueue.volume);
    serverQueue.textChannel.send(`Now Playing: ***${song.title}***`);
    UpdatePlaying(queue, guild, song);
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

    console.log(`Setting volume to: ${value}`);

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

async function CreateSongInfoFromUrl(url) {
    var songInfo, song = {};
    try {
        songInfo = await ytdl.getInfo(url);
        song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        }
    } catch(error) {
        throw `${url} is not a valid youtube url.`;
    }
    console.log('returning song...');
    return song;
}

function UpdatePlaying(queue, guild, song = null) {
    const serverQueue = queue.get(guild.id);

    if(song != null) {
        serverQueue.playing = true;
        serverQueue.nowPlaying = song;
    } else {
        serverQueue.playing = false;
        serverQueue.nowPlaying = {};
    }

    queue.set(guild.id, serverQueue);
}

function LoadMusicCommands() {
    console.log('Loading music commands...');
    const musicCommandCollection = new Map();
    const musicCommands = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'));

    for(const file of musicCommands) {
        const command = require(`../commands/music/${file}`);
    
        musicCommandCollection.set(command.name, command);
    }
    return musicCommandCollection;
}

async function QueueSongs(queue, message, songs) {
    const serverQueue = queue.get(message.guild.id);

    // Create song info and add them into 'formattedSongs' array
    let formattedSongs = songs.map(async url => {
        try {
            const song = await CreateSongInfoFromUrl(url);
            return song;
        } catch(error) {
            return error;
        }
    });

    // Wait for all song info inside 'formattedSongs' are completed and save them into 'resolvedSongQueue'
    const resolvedSongQueue = await Promise.all(formattedSongs);
    
    // Add songs into the song queue or let the user know that they added an invalid youtube url
    resolvedSongQueue.forEach(song => {
        if(typeof(song) !== 'object' || song === null) {
            console.log(typeof(song));
            return message.reply(song);
        }
        serverQueue.songs.push(song);
        message.channel.send(`${song.title} has been added to the queue!`);
    });
}

function QueuePlaylist(queue, message, songs) {
    const serverQueue = queue.get(message.guild.id);

    let songInfo = songs.map(song => {
        return {title: song.title, url: song.url};
    });

    songInfo.forEach(song => {
        serverQueue.songs.push(song);
    });

    message.channel.send(`${songInfo.length} songs have been added to the queue!`);
}


module.exports = {
    JoinChannel,
    CreateQueue,
    UpdateQueue,
    Play,
    SetVolume,
    ValidateVolume,
    UpdatePlaying,
    LoadMusicCommands,
    QueueSongs,
    QueuePlaylist
}