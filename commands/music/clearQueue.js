module.exports = {
    name: 'c',
    description: 'Removes all songs from the queue',
    execute(message, data) {

        if(data.serverInfo.songs) {
            data.serverInfo.songs.splice(0, data.serverInfo.songs.length);
        }

        data.serverList.set(message.guild.id, data.serverInfo);

        message.channel.send('All songs have been cleared from the queue.');
    }
}