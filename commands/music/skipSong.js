const { Play } = require('../../utils/musicUtils.js');

module.exports = { 
    name: 's',
    description: 'Removes the first song in the queue, skips over to next song if a song is currently being played',
    execute(message, data) {
        if(data.serverInfo.songs.length == 0) {
            return message.reply('There are no songs in the queue.');
        }

        const currentSongs = data.serverInfo.songs;
        let value = data.args[0];

        if(value != null) {
            if(!isNaN(value)) {
                value = parseInt(value);
                currentSongs.splice(0, value || currentSongs.length);
                message.channel.send(`Skipped ${value} song(s)!`);
            } else {
                return message.reply('Please enter a valid number.');
            }
        } else {
            let skippedSong = currentSongs.shift();
            message.channel.send(`${skippedSong.title} has been skipped!`);
        }

        if(data.serverInfo.playing) {
            if(currentSongs.length > 0){
                Play(data.serverList, message.guild, currentSongs[0]);
            } else {
                data.serverInfo.UpdatePlaying(message.guild.id, data.serverList);
                data.serverInfo.connection.dispatcher.end();
            }
        }

        data.serverList.set(message.guild.id, data.serverInfo);
    }
}