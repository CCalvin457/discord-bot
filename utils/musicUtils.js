const ytdl = require('ytdl-core');
const ytdlDiscord = require('ytdl-core-discord');
const fs = require('fs');
const { Repeat } = require('./repeatEnum.js');
const { MessageEmbed, Collection } = require('discord.js');
const { database } = require('./firestore');

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

// Attempts to leave the voice channel.
// Returns false if bot was never in a voice channel
// Returns true if bot has left the voice channel
function LeaveChannel(server, guildId, bot) {
    if(bot.voice.channel === null) {
        return false;
    }

    server.serverInfo.ClearServerConnectionInfo(server.serverList, guildId);

    bot.voice.channel.leave();
        
    return true;
}

async function Play(serverList, guild, song) {
    console.log('hello');
    const serverInfo = serverList.get(guild.id);
    const musicPlayer = serverInfo.musicPlayer;
    if(!song) {
        musicPlayer.UpdatePlaying();
        serverInfo.textChannel.send(`There are no more songs in the queue, leaving voice channel.`);

        // reset set currentSongIndex back to 0
        musicPlayer.currentSongIndex = 0;

        const server = {
            serverInfo: serverInfo,
            serverList: serverList
        }

        let response = LeaveChannel(server, guild.id, guild.me);

        if(!response) {
            return serverInfo.textChannel.send('I\'m not currently in a voice channel!');
        }
        return serverInfo.textChannel.send('Successfully left the voice channel!');
    }

    const dispatcher = serverInfo.connection
        .play(await ytdlDiscord(song.url), {type: 'opus'})
        .on('finish', () => {
            let songIndex = (musicPlayer.currentSongIndex + 1) < musicPlayer.songs.length ? musicPlayer.currentSongIndex + 1 : 0;

            if(musicPlayer.repeat === Repeat.One) {
                // if repeat is set to one, just set the songIndex to currentSongIndex
                songIndex = musicPlayer.currentSongIndex;
            }

            if(musicPlayer.repeat === Repeat.Off && songIndex < musicPlayer.currentSongIndex) {
                // If there repeat is off and we have gone through all songs, set song index to -1 to stop playing music
                songIndex = -1;
            }

            musicPlayer.currentSongIndex = songIndex;
            Play(serverList, guild, musicPlayer.songs[songIndex]);
        })
        .on('error', error => {
            musicPlayer.UpdatePlaying();
            console.error(error);
        });
    
    dispatcher.setVolumeLogarithmic(musicPlayer.volume);
    serverInfo.textChannel.send(`Now Playing: ***${song.title}***`);
    musicPlayer.UpdatePlaying(song);
}

function ValidateVolume(value) {
    const volume = Number(value);

    let returnValue = {
        success: false,
        value: NaN,
        message: ''
    }

    console.log(`Attempting to set volume to: ${value}`);

    if(Number.isNaN(volume)) {
        returnValue.message = 'You must enter a valid number to set the volume';
    }else if(volume < 0 || volume > 100) {
        returnValue.message = 'Please enter a value between 0 and 100';
    } else {
        returnValue.success = true;
        returnValue.value = volume / 100;
        returnValue.message = undefined;
    }

    return returnValue;
}

async function CreateSongInfoFromUrl(url) {
    var songInfo, song = {};

    try {
        songInfo = await ytdlDiscord.getBasicInfo(url);
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
    const musicCommandCollection = new Collection();
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
    const musicPlayer = serverInfo.musicPlayer;
    const songList = await CreateSongList(message, songs);

    songList.forEach(song => {
        musicPlayer.songs.push(song);
        message.channel.send(`${song.title} has been added to the queue!`);
    });

    // serverList.set(message.guild.id, serverInfo);
}

function QueuePlaylist(serverList, message, songs) {
    const serverInfo = serverList.get(message.guild.id);
    const musicPlayer = serverInfo.musicPlayer;

    let songInfo = songs.map(song => {
        return {title: song.title, url: song.url};
    });

    songInfo.forEach(song => {
        musicPlayer.songs.push(song);
    });

    message.channel.send(`${songInfo.length} songs have been added to the queue!`);

    // serverList.set(message.guild.id, serverInfo);
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

async function GetFavouriteSong(message, guildId, query) {
    let song = '';
    // find all songs that contains the query
    const results = await database.collection('servers').doc(guildId).collection('favouriteSongs').where('name', '==', query).get();

    if(!results.empty) {
        if(results.docs.length === 1) {
            song = results.docs[0].data().url;
        } else {
            // If there are multiple songs which have the same name, we let the user select which song to play or add to the queue
            // Maybe separate some of these into their own functions?
            let querySongs = [];
            results.docs.forEach(result => {
                querySongs.push(result.data());
            });

            const songList = SongListForEmbed(querySongs);

            // filter for user input
            const filter = response => {
                return !isNaN(response.content) && (response.content > 0 && response.content <= querySongs.length);
            }

            const songListEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Song List')
                .setDescription('Which song did you want to play?')
                .addFields(songList);
            
            // Allows users to input a number to select which song to play or add to the queue
            message.channel.send(songListEmbed);

            const songSelect = await message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
                .then(collected => {
                    const index = collected.first().content - 1;
                    return querySongs[index];
                })
                .catch(() => {
                    return false;
                });

            if(!songSelect) {
                return message.channel.send('Song selection timed out.');
            } else {
                song = songSelect.url;
            }
        }
    } else {
        song = undefined;
    }

    return song;
}


module.exports = {
    JoinChannel,
    LeaveChannel,
    Play,
    ValidateVolume,
    LoadMusicCommands,
    CreateSongList,
    QueueSongs,
    QueuePlaylist,
    SongListForEmbed,
    GetFavouriteSong
}