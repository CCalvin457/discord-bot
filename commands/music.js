const { JoinChannel, CreateQueue, Play } = require('../utils/musicUtils.js');
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
                    }
                });
                break;
            case 'l':
                if(bot.voice.channel != null) {
                    bot.voice.channel.leave();
                    data.queue.connection = null;
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
                        console.log('hi')
                        JoinChannel(message).then(connection => {
                            CreateQueue(data.queue, message, voiceChannel, connection);
                            Play(data.queue, message.guild, song);
                        });
                    } else {
                        console.log('tf');
                        JoinChannel(message).then(connection => {
                            data.serverQueue.connection = connection;
                            Play(data.queue, message.guild, song);
                        })
                        // console.log(`serverqueue already here: ${data.serverQueue}`);
                    }
                } else {
                    Play(data.queue, message.guild, song);
                }
                break;
            case 'v':
                if(data.args[1] == null) {
                    message.reply('second argument missing');
                    return;
                }


                
                break;
            default:
                message.reply('Invalid argument(s)');
        }
    }
}