const { JoinChannel, CreateQueue, UpdateQueue, Play, SetVolume } = require('../utils/musicUtils.js');
const ytdl = require('ytdl-core');
module.exports = {
    name: 'music',
    description: 'Allows user to request a song for the bot to play',
    async execute(message, data) {
        if(!message.guild) return;

        const voiceChannel = message.member.voice.channel;
        const bot = message.guild.me;

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
                    
                    message.channel.send('Successfully left the voice channel!');
                } else {
                    message.reply('I\'m not currently in a voice channel!');
                }
                break;
            case 'p':
                if(data.args[1] == null) {
                    return message.reply('Please specify the song you wish to play by entering a youtube url');
                }
                const songInfo = await ytdl.getInfo(data.args[1]);

                const song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url
                }

                if(bot.voice.channel == null || bot.voice.channel != voiceChannel) {
                    if(!data.serverQueue) {
                        JoinChannel(message).then(connection => {
                            CreateQueue(data.queue, message, voiceChannel, connection);
                            Play(data.queue, message.guild, song);
                        });
                    } else {
                        JoinChannel(message).then(connection => {
                            UpdateQueue(data.queue, message, voiceChannel, connection);
                            Play(data.queue, message.guild, song);
                        });
                    }
                } else {
                    console.log('already in correct channel');
                    Play(data.queue, message.guild, song);
                }
                break;
            case 'v':
                if(data.args[1] == null) {
                    message.reply('second argument missing');
                    return;
                }

                if(!data.serverQueue) {
                    CreateQueue(data.queue, message);
                    data.serverQueue = data.queue.get(message.guild.id);
                }

                const volume = Number(data.args[1]);

                if(volume == NaN) {
                    return message.reply('You must enter a valid number to set the volume');
                }

                if(volume < 0.0 || volume > 1.0) {
                    return message.reply('Please enter a value between 0 and 1');
                }

                if(data.serverQueue.connection) {
                    data.serverQueue.connection.dispatcher.setVolumeLogarithmic(volume);
                }

                SetVolume(data.queue, message.guild, volume);

                message.channel.send(`Volume has been set to ${(volume * 100)}%`)
                break;
            default:
                message.reply('Invalid argument(s)');
        }
    }
}