const ytdlDiscord = require('ytdl-core-discord');
const fs = require('fs');
const { Repeat } = require('./repeatEnum.js');
const { MessageEmbed, Collection, Guild } = require('discord.js');
const { database } = require('./firestore');

/**
 * Attempts to join the channel the user is in
 * @param {Message} message 
 * @returns {VoiceConnection} The voice connection the bot has connected to
 */
async function JoinChannel(message) {
    const voiceChannel = message.member.voice.channel;
    var connection;

    try {
        connection = await voiceChannel.join();
    } catch(error) {
        if(!voiceChannel) {
            throw 'you are currently not in a voice channel! Please join a voice channel first.';
        }
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            throw 'I need the permissions to join and speak in your voice channel!';
        }
    }

    return connection;
}

/**
 * Attempts to leave the voice channel
 * @param {Server} server The server information
 * @param {GuildMember} bot Reference to the discord bot itself
 * @returns {boolean} False if the bot was not in a channel. True if the bot leaves the channel successfully. 
 */
function LeaveChannel(server, bot) {
    if(bot.voice.channel === null) {
        return false;
    }

    server.ClearServerConnectionInfo();

    bot.voice.channel.leave();
        
    return true;
}

/**
 * Discord bot plays the music
 * @param {Server} server The server information
 * @param {Guild} guild Reference to the bot for when it finishes playing all songs
 * @param {object} song An object containing the youtube url and song title
 * @returns Sends a message to the user after the bot leaves the channel
 */
async function Play(server, guild, song) {
    console.log('hello');
    const musicPlayer = server.musicPlayer;
    if(!song) {
        musicPlayer.UpdatePlaying();
        server.textChannel.send(`There are no more songs in the queue, leaving voice channel.`);

        // reset set currentSongIndex back to 0
        musicPlayer.currentSongIndex = 0;

        let response = LeaveChannel(server, guild.me);

        if(!response) {
            return server.textChannel.send('I\'m not currently in a voice channel!');
        }
        return server.textChannel.send('Successfully left the voice channel!');
    }

    const dispatcher = server.connection
        .play(await ytdlDiscord(song.url), {type: 'opus', highWaterMark: 1})
        .on('finish', () => {
            // Check to see if we increment the songIndex by 1 if it will go past the length of our song list.
            // If it does, set it to -1.
            let songIndex = (musicPlayer.currentSongIndex + 1) < musicPlayer.songs.length ? musicPlayer.currentSongIndex + 1 : -1;

            if(musicPlayer.repeat === Repeat.One) {
                // if repeat is set to one, just set the songIndex to currentSongIndex
                songIndex = musicPlayer.currentSongIndex;
            }

            if(musicPlayer.repeat === Repeat.On && songIndex < musicPlayer.currentSongIndex) {
                // If repeat is on and songIndex is smaller than current song index
                songIndex = 0;
            }

            musicPlayer.currentSongIndex = songIndex;
            Play(server, guild, musicPlayer.songs[songIndex]);
        })
        .on('error', error => {
            musicPlayer.UpdatePlaying();
            console.error(error);
        });
    
    dispatcher.setVolumeLogarithmic(musicPlayer.volume);
    server.textChannel.send(`Now Playing: ***${song.title}***`);
    musicPlayer.UpdatePlaying(song);
}

/**
 * Validates whether or not the provided value is a number between 0 and 100
 * @param {number} value The value to check
 * @returns {object} An object that provides if it check was successful, the value, and a potential error message
 */
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

/**
 * Creates song information from given URL (song title and URL).
 * @param {string} url 
 * @returns {object} Song details - Song title and URL
 */
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

/**
 * Searches through all files in the music folder and creates an object used for the help command.
 * @returns {object} Music command details for the help command
 */
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

/**
 * Creates a list of song objects that is used to play songs
 * @param {Message} message DiscordJS Message Object
 * @param {array} songs An array of YouTube URLs
 * @returns {array} A list of song objects 
 */
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

/**
 * Takes the list of songs (YouTube URLSs) and adds them into the servers song queue
 * @param {Server} server Object containing server information
 * @param {Message} message DiscordJS Message object
 * @param {array} songs List of YouTube URLs
 */
async function QueueSongs(server, message, songs) {
    const musicPlayer = server.musicPlayer;
    const songList = await CreateSongList(message, songs);

    songList.forEach(song => {
        musicPlayer.songs.push(song);
        message.channel.send(`${song.title} has been added to the queue!`);
    });
}

/**
 * Creates a list of song objects from a playlist and adds them into the servers song queue
 * @param {Server} server Object containing server information
 * @param {Message} message DiscordJS Message object
 * @param {array} songs List of ytpl items
 */
function QueuePlaylist(server, message, songs) {
    const musicPlayer = server.musicPlayer;

    let songInfo = songs.map(song => {
        return {title: song.title, url: song.url};
    });

    songInfo.forEach(song => {
        musicPlayer.songs.push(song);
    });

    message.channel.send(`${songInfo.length} songs have been added to the queue!`);
}

/**
 * Creates a list of song objects that will be used for an embeded message
 * @param {array} songs List of song objects
 * @returns {array} List of objects to be used in an Embeded message
 */
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

/**
 * Retrieves a users favourited song from the database
 * @param {Message} message DiscordJS Message object
 * @param {string} guildId The id of the discord server
 * @param {string} query The name of the favourited song
 * @returns {object} The selected song object
 */
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
                .setTitle(`Song List: "${query}"`)
                .setDescription(`Which song did you want to play?\n\nPlease enter a number to select your song`)
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