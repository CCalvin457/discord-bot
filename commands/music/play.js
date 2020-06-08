const { JoinChannel, Play, UpdateQueue, CreateSongInfo } = require('../../utils/musicUtils.js');
module.exports = {
    name: 'p',
    description: `Plays a song given a youtube url. If a song is already playing, it will queue the song instead
If no url is given it will play the first song in the queue, provided something is there`,
    async execute(message, data) {
        const bot = message.guild.me;
        if(data.args[1] == null && data.serverQueue.songs.length == 0) {
            return message.reply('Please specify the song you wish to play by entering a youtube url');
        }

        let song = {};

        if(data.args[1] != null) {
            try {
                // Try to create song info from given url
                song = await CreateSongInfo(data.args[1]); 
            } catch(error) {
                // error should occur when the url given is invalid
                return message.reply(error);
            }
            
            data.serverQueue.songs.push(song);
        }

        if(Object.keys(song).length !== 0) {
            console.log(song);
            message.reply(`${song.title} has been added to the queue!`);
        }
        

        if(bot.voice.channel == null || bot.voice.channel != data.voiceChannel) {
            JoinChannel(message).then(connection => {
                UpdateQueue(data.queue, message, data.voiceChannel, connection);
                Play(data.queue, message.guild, data.serverQueue.songs[0]);
            }).catch(error => {
                return message.reply(error);
            });
        } else {
            console.log('already in correct channel');
            Play(data.queue, message.guild, data.serverQueue.songs[0]);
        }
    }
}