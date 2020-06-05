const { JoinChannel, CreateQueue, UpdateQueue, Play, SetVolume, ValidateVolume, CreateSongInfo } = require('../utils/musicUtils.js');
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
module.exports = {
    name: 'music',
    description: 'Allows user to request a song for the bot to play',
    async execute(message, data) {
        if(!message.guild) return;

        const voiceChannel = message.member.voice.channel;
        const bot = message.guild.me;
        let song;

        if(!data.serverQueue) {
            CreateQueue(data.queue, message);
            data.serverQueue = data.queue.get(message.guild.id);
        }

        switch(data.args[0]) {
            case 'j':
                JoinChannel(message).then(connection => {
                    UpdateQueue(data.queue, message, voiceChannel, connection);
                });
                break;
            case 'l':
                if(bot.voice.channel != null) {
                    data.serverQueue.connection = null;
                    data.serverQueue.voiceChannel = null;
                    data.serverQueue.playing = false;
                    data.serverQueue.nowPlaying = {};

                    data.queue.set(message.guild.id, data.serverQueue);

                    bot.voice.channel.leave();
                    
                    return message.channel.send('Successfully left the voice channel!');
                } else {
                    return message.reply('I\'m not currently in a voice channel!');
                }
                break;
            case 'p':
                if(data.args[1] == null && data.serverQueue.songs.length == 0) {
                    return message.reply('Please specify the song you wish to play by entering a youtube url');
                }

                if(data.args[1] != null) {
                    song = await CreateSongInfo(data.args[1]);
                
                    data.serverQueue.songs.push(song);
                }

                if(data.serverQueue.playing) {
                    return message.reply(`${song.title} has been added to the queue!`);
                }

                if(bot.voice.channel == null || bot.voice.channel != voiceChannel) {
                    JoinChannel(message).then(connection => {
                        UpdateQueue(data.queue, message, voiceChannel, connection);
                        Play(data.queue, message.guild, data.serverQueue.songs[0]);
                    });
                } else {
                    console.log('already in correct channel');
                    Play(data.queue, message.guild, data.serverQueue.songs[0]);
                }
                break;
            case 'v':
                if(data.args[1] == null) {
                    return message.reply('Please include a value between 0 and 1');
                }

                const volumeInfo = ValidateVolume(data.args[1]);

                if(!volumeInfo.success) {
                    return message.reply(volumeInfo.message);
                }

                SetVolume(data.queue, message, volumeInfo.value);
                break;
            case 'np':
                if(!data.serverQueue.playing) {
                    return message.reply('no song currently playing');
                }
                
                const currentSong = data.serverQueue.nowPlaying;

                const curSongEmbed = new Discord.MessageEmbed()
                    .setColor('#a6f87e')
                    .setTitle('Now Playing')
                    .addField(currentSong.title, currentSong.url)

                message.channel.send(curSongEmbed);
                break;
            case 'q':
                if(data.args[1] == null) {
                    return message.reply('Please include a youtube url');
                }

                song = await CreateSongInfo(data.args[1]);

                data.serverQueue.songs.push(song);

                message.reply(`${song.title} has been added to the queue!`);

                break;
            case 'list':
                const songList = data.serverQueue.songs;
                console.log(songList);
                if(songList.length == 0) {
                    return message.channel.send('There are currently no songs in the queue.');
                }

                const songs = [];

                for(var i = 0; i < songList.length; i++) {
                    let curSong = songList[i];
                    songs.push({
                        name: `${i + 1}. ${curSong.title}`,
                        value: curSong.url
                    });
                }

                const musicListEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Song List')
                    .setDescription('Songs currently in the queue')
                    .addFields(songs)

                message.channel.send(musicListEmbed);

                break;
            case 's':
                if(data.serverQueue.songs.length == 0) {
                    return message.reply('There are no songs in the queue.');
                }

                if(data.serverQueue.playing) {
                    
                }

                data.serverQueue.songs.shift();
                Play(data.queue, message.guild, data.serverQueue.songs[0]);
                break;
            default:
                message.reply('Invalid argument(s)');
        }
    }
}