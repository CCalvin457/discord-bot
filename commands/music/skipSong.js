const { Play } = require('../../utils/musicUtils.js');

module.exports = { 
    name: 'skip',
    description: `Allows the user to skip a number of songs. 
                    If no number is provided then the first song in the queue will be skipped.
                    Skipped songs are removed from the queue.`,
    aliases: ['s'],
    execute(message, data) {
        const serverInfo = data.serverInfo;
        const serverList = data.serverList;

        if(serverInfo.songs.length == 0) {
            return message.reply('There are no songs in the queue.');
        }

        const currentSongs = serverInfo.songs;
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

        if(serverInfo.playing) {
            if(currentSongs.length > 0){
                Play(serverList, message.guild, currentSongs[0]);
            } else {
                serverInfo.UpdatePlaying(message.guild.id, serverList);
                serverInfo.connection.dispatcher.end();
            }
        }

        serverList.set(message.guild.id, serverInfo);
    }
}