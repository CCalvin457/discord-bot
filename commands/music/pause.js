module.exports = {
    name: 'pause',
    descripton: `Pauses the song, if there is one currently playing.
                    *aliases*: \`pause\`, \'pa\``,
    aliases: ['pa'],
    execute(message, data) {
        const serverInfo = data.serverInfo;
        const serverList = data.serverList;

        if(serverInfo.playing){
            serverInfo.connection.dispatcher.pause();
            serverInfo.playing = false;
            message.channel.send('Paused');
        } else {
            serverInfo.connection.dispatcher.resume();
            serverInfo.playing = true;
            message.channel.send('Resumed');
        }

        serverList.set(message.guild.id, serverInfo);
    }
}