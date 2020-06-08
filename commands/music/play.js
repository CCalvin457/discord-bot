const { JoinChannel, Play, UpdateQueue, CreateSongInfo } = require('../../utils/musicUtils.js');
module.exports = {
    name: 'p',
    description: `Plays a song given a youtube url. If a song is already playing, it will queue the song instead
If no url is given it will play the first song in the queue, provided something is there`,
    async execute(message, data) {
        console.log(data.args);
        const bot = message.guild.me;
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

        if(bot.voice.channel == null || bot.voice.channel != data.voiceChannel) {
            JoinChannel(message).then(connection => {
                UpdateQueue(data.queue, message, data.voiceChannel, connection);
                Play(data.queue, message.guild, data.serverQueue.songs[0]);
            });
        } else {
            console.log('already in correct channel');
            Play(data.queue, message.guild, data.serverQueue.songs[0]);
        }
    }
}