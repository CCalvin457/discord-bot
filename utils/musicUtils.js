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

function Play(serverList, guild, song) {
    console.log('hello');
    const serverInfo = serverList.get(guild.id);

    if(!song) {
        serverInfo.UpdatePlaying(guild.id, serverList);
        return;
    }

    console.log(song);

    const dispatcher = serverInfo.connection
        .play(ytdl(song.url, {filter: "audioonly"}))
        .on('finish', () => {
            let currentSong = serverInfo.songs.shift();

            if(serverInfo.repeat == Repeat.On) {
                serverInfo.songs.push(currentSong);
            }
            
            if(serverInfo.repeat == Repeat.One) {
                serverInfo.songs.unshift(currentSong);
            }

            Play(serverList, guild, serverInfo.songs[0]);
        })
        .on('error', error => {
            console.error(error);
        });
    
    dispatcher.setVolumeLogarithmic(serverInfo.volume);
    serverInfo.textChannel.send(`Now Playing: ***${song.title}***`);
    serverInfo.UpdatePlaying(guild.id, serverList, song);
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

async function CreateSongList(message, songs) {
    let finalSongList = [];

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
            return message.reply(song);
        }
        finalSongList.push(song);
    });
    
    return finalSongList;
}

async function QueueSongs(serverList, message, songs) {
    const serverInfo = serverList.get(message.guild.id);

    const songList = await CreateSongList(message, songs);

    songList.forEach(song => {
        serverInfo.songs.push(song);
        message.channel.send(`${song.title} has been added to the queue!`);
    });

    serverList.set(message.guild.id, serverInfo);
}

function QueuePlaylist(serverList, message, songs) {
    const serverInfo = serverList.get(message.guild.id);

    let songInfo = songs.map(song => {
        return {title: song.title, url: song.url};
    });

    songInfo.forEach(song => {
        serverInfo.songs.push(song);
    });

    message.channel.send(`${songInfo.length} songs have been added to the queue!`);

    serverList.set(message.guild.id, serverInfo);
}

function SongListForEmbed(songs) {
    const songList = [];

    for(var i = 0; i < songs.length; i++) {
        let curSong = songs[i];
        songList.push({
            name: `${i + 1}. ${curSong.title}`,
            value: curSong.url
        });
    }

    return songList;
}


module.exports = {
    JoinChannel,
    Play,
    ValidateVolume,
    LoadMusicCommands,
    CreateSongList,
    QueueSongs,
    QueuePlaylist,
    SongListForEmbed
}