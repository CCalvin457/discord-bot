module.exports = {
    name: 'c',
    description: 'Removes all songs from the queue',
    execute(message, data) {
        const serverInfo = data.serverInfo;
        const serverList = data.serverList;

        if(serverInfo.songs) {
            serverInfo.songs.splice(0, serverInfo.songs.length);
        }

        serverList.set(message.guild.id, serverInfo);

        message.channel.send('All songs have been cleared from the queue.');
    }
}