const { JoinChannel, CreateQueue, UpdateQueue, Play, SetVolume, ValidateVolume, CreateSongInfo } = require('../utils/musicUtils.js');
const ytdl = require('ytdl-core');
module.exports = {
    name: 'music',
    description: 'Allows user to request a song for the bot to play',
    async execute(message, data) {
        if(!message.guild) return;

        const voiceChannel = message.member.voice.channel;
        const bot = message.guild.me;
        let song;

        switch(data.args[0]) {
            case 'j':
                JoinChannel(message).then(connection => {
                    if(!data.serverQueue) {
                        CreateQueue(data.queue, message, voiceChannel, connection);
                    } else {
                        UpdateQueue(data.queue, message, voiceChannel, connection);
                    }
                });
                break;
            case 'l':
                if(bot.voice.channel != null) {
                    if(data.serverQueue) {
                        data.serverQueue.connection = null;
                        data.serverQueue.voiceChannel = null;

                        data.queue.set(message.guild.id, data.serverQueue);
                    }

                    bot.voice.channel.leave();
                    
                    return message.channel.send('Successfully left the voice channel!');
                } else {
                    return message.reply('I\'m not currently in a voice channel!');
                }
                break;
            case 'p':
                if(data.args[1] == null) {
                    return message.reply('Please specify the song you wish to play by entering a youtube url');
                }

                song = await CreateSongInfo(data.args[1]);
                

                if(!data.serverQueue) {
                    CreateQueue(data.queue, message);
                    data.serverQueue = data.queue.get(message.guild.id);
                }

                const songs = data.serverQueue.songs;
                
                songs.push(song);

                if(bot.voice.channel == null || bot.voice.channel != voiceChannel) {
                    JoinChannel(message).then(connection => {
                        UpdateQueue(data.queue, message, voiceChannel, connection);
                        Play(data.queue, message.guild, songs[0]);
                    });
                } else {
                    console.log('already in correct channel');
                    Play(data.queue, message.guild, songs[0]);
                }
                break;
            case 'v':
                if(data.args[1] == null) {
                    return message.reply('Please include a value between 0 and 1');
                }

                if(!data.serverQueue) {
                    CreateQueue(data.queue, message);
                    data.serverQueue = data.queue.get(message.guild.id);
                }

                const volumeInfo = ValidateVolume(data.args[1]);

                if(!volumeInfo.success) {
                    return message.reply(volumeInfo.message);
                }

                SetVolume(data.queue, message, volumeInfo.value);
                break;
            case 'np':
                if(!data.serverQueue || !data.serverQueue.connection) {
                    return message.reply('No song currently playing');
                }

                
                break;
            case 'q':
                if(data.args[1] == null) {
                    return message.reply('Please include a youtube url');
                }
                
                if(!data.serverQueue) {
                    CreateQueue(data.queue, message);
                    data.serverQueue = data.queue.get(message.guild.id);
                }

                song = await CreateSongInfo(data.args[1]);

                data.serverQueue.songs.push(song);

                return message.reply(`${song.title} has been added to the queue!`);

                break;
            default:
                message.reply('Invalid argument(s)');
        }
    }
}