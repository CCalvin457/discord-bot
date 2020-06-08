const { Play, UpdatePlaying } = require('../../utils/musicUtils.js');

module.exports = { 
    name: 's',
    description: 'Removes the first song in the queue, skips over to next song if a song is currently being played',
    execute(message, data) {
        if(data.serverQueue.songs.length == 0) {
            return message.reply('There are no songs in the queue.');
        }

        const currentSongs = data.serverQueue.songs
        let value = data.args[1];

        if(value != null) {
            if(!isNaN(value)) {
                value = parseInt(value);
                currentSongs.splice(0, value || currentSongs.length);
                message.channel.send(`Songs skipped!`);
            } else {
                return message.reply('Please enter a valid number.');
            }
        } else {
            let skippedSong = currentSongs.shift();
            message.channel.send(`${skippedSong.title} has been skipped!`);
        }

        if(data.serverQueue.playing) {
            if(currentSongs.length > 0){
                Play(data.queue, message.guild, currentSongs[0]);
            } else {
                UpdatePlaying(data.queue, message.guild);
                data.serverQueue.connection.dispatcher.end();
            }
        }
    }
}