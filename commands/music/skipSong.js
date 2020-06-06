const { Play } = require('../../utils/musicUtils.js');

module.exports = { 
    name: 's',
    description: 'Removes the first song in the queue, skips over to next song if a song is currently being played',
    execute(message, data) {
        if(data.serverQueue.songs.length == 0) {
            return message.reply('There are no songs in the queue.');
        }

        let skippedSong = data.serverQueue.songs.shift();
        message.channel.send(`${skippedSong.title} has been skipped!`);

        if(data.serverQueue.playing) {
            if(data.serverQueue.songs.length > 0){
                Play(data.queue, message.guild, data.serverQueue.songs[0]);
            } else {
                data.serverQueue.connection.dispatcher.end();
            }
        }
    }
}